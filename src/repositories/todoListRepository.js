const { QueryCommand, GetCommand, UpdateCommand, DeleteCommand, TransactWriteCommand } = require('@aws-sdk/lib-dynamodb');
const { UserToListTableName, UserToListKey, UserToListSecondaryKey, TodoListTableName, TodoListKey, TodoTableName, TodoKey, TodoSecondaryKey } = require('../config');
const DBUtil = require('./database/dbUtil');

/**
 * Repository for managing Todo Lists.
 */
class TodoListRepository {
  /**
   * Creates an instance of TodoListRepository.
   * @param {DatabaseManager} databaseManager - The database manager.
   * @param {UserRepository} userRepository - The user repository.
   */
  constructor(databaseManager, userRepository) {
    /** @type {import('./database/databaseManager')} */
    this.databaseManager = databaseManager;
    /** @type {import('./userRepository')} */
    this.userRepository = userRepository;

    /**
     * @type {import('@aws-sdk/lib-dynamodb').DynamoDBDocumentClient}
     */
    this.client = this.databaseManager.getClient();
  }

  /**
   * Finds a user to list keys.
   * @param {string} userId - The user ID.
   * @param {string} listId - The list ID.
   * @returns {Promise<any>} The user to list keys.
   */
  async findUserToListKeys(userId, listId) {
    const command = new GetCommand({
      TableName: UserToListTableName,
      Key: {
        [UserToListKey]: userId,
        [UserToListSecondaryKey]: listId
      }
    });
    const response = await this.client.send(command);
    return response.Item;
  }

  /**
   * Finds todo lists by user ID.
   * @param {string} userId - The user ID.
   * @returns {Promise<any[]>} The list of todo lists.
   */
  async findByUserId(userId) {
    const command = new QueryCommand({
      TableName: UserToListTableName,
      KeyConditionExpression: '#u = :u',
      ExpressionAttributeNames: {
        '#u': UserToListKey
      },
      ExpressionAttributeValues: {
        ':u': userId
      }
    });
    const response = await this.client.send(command);
    return response.Items;
  }

  /**
   * Finds a todo list by ID.
   * @param {string} listId - The list ID.
   * @returns {Promise<any>} The todo list.
   */
  async findById(listId) {
    const command = new GetCommand({
      TableName: TodoListTableName,
      Key: {
        [TodoListKey]: listId
      }
    });
    const response = await this.client.send(command);
    return response.Item;
  }

  /**
   * Finds todos by list ID with optional filtering and sorting.
   * @param {string} listId - The list ID.
   * @param {object} [options] - Optional filtering and sorting options.
   * @param {object} [options.filters] - Filters to apply. An array of key-value pairs.
   * @param {string} [options.sortBy] - Field to sort by.
   * @param {string} [options.sortOrder] - Sort order ('asc' or 'desc').
   * @returns {Promise<any[]>} The list of todos.
   */
  async findTodosByListId(listId, options = {}) {
    const expressionAttributeNames = { '#listId': 'listId' };
    const expressionAttributeValues = { ':listId': listId };

    let keyConditionExpression = '#listId = :listId';
    let filterExpression = '';

    if (options.filters) {
      const filterConditions = [];
      for (const [field, value] of Object.entries(options.filters)) {
        if (value) {
          const fieldPlaceholder = `#${field}`;
          const valuePlaceholder = `:${field}`;
          expressionAttributeNames[fieldPlaceholder] = field;
          expressionAttributeValues[valuePlaceholder] = value;
          filterConditions.push(`${fieldPlaceholder} = ${valuePlaceholder}`);
        }
      }
      filterExpression = filterConditions.join(' AND ');
    }

    const commandParams = {
      TableName: TodoTableName,
      KeyConditionExpression: keyConditionExpression,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues
    };

    if (filterExpression) {
      commandParams.FilterExpression = filterExpression;
    }

    const command = new QueryCommand(commandParams);
    const response = await this.client.send(command);
    let items = response.Items;

    // Sort the items if sorting options are provided
    if (options.sortBy) {
      items = items.sort((a, b) => {
        const fieldA = a[options.sortBy];
        const fieldB = b[options.sortBy];
        if (options.sortOrder === 'desc') {
          return fieldB > fieldA ? 1 : fieldB < fieldA ? -1 : 0;
        }
        return fieldA > fieldB ? 1 : fieldA < fieldB ? -1 : 0;
      });
    }

    return items;
  }

  /**
   * Creates a new todo list.
   * @param {string} userId - The user ID.
   * @param {object} todoListData - The todo list data.
   * @returns {Promise<any>} The created todo list.
   */
  async create(userId, todoListData) {
    const userToListItem = { role: 0, [UserToListKey]: userId, [UserToListSecondaryKey]: todoListData.listId };

    const transactCommand = new TransactWriteCommand({
      TransactItems: [
        {
          Put: {
            TableName: TodoListTableName,
            Item: todoListData,
            ConditionExpression: 'attribute_not_exists(#listId)',
            ExpressionAttributeNames: {
              '#listId': TodoListKey
            }
          }
        },
        {
          Put: {
            TableName: UserToListTableName,
            Item: userToListItem
          }
        }
      ]
    });
    await this.client.send(transactCommand);
    return todoListData;
  }

  /**
   * Updates a todo list.
   * @param {string} listId - The list ID.
   * @param {object} updateData - The update data.
   * @returns {Promise<{ listId: string }>} The updated todo list ID.
   */
  async update(listId, updateData) {
    const updateParam = DBUtil.composeUpdateRequest(listId, null, updateData, TodoListTableName, TodoListKey, null);
    const command = new UpdateCommand(updateParam);
    await this.client.send(command);
    return { listId };
  }

  /**
   * Deletes a todo list.
   * @param {string} listId - The list ID.
   * @returns {Promise<{ listId: string }>} The deleted todo list ID.
   */  
  async delete(listId) {
      const todoItems = await this.findTodosByListId(listId);

      const deleteTodoItemCommands = todoItems.map(item => ({
        TableName: TodoTableName,
        Key: {
          [TodoKey]: item[TodoKey],
          [TodoSecondaryKey]: item[TodoSecondaryKey]
        }
      }));

      const deleteUserToListItems = await this.userRepository.getUsersByList(listId);
      const deleteUserToListCommands = deleteUserToListItems.map(userToList => ({
        TableName: UserToListTableName,
        Key: {
          [UserToListKey]: userToList.userId,
          [UserToListSecondaryKey]: userToList.listId
        }
      }));

      const deleteRequests = [
        {
          TableName: TodoListTableName,
          Key: {
            [TodoListKey]: listId
          }
        },
        ...deleteUserToListCommands,
        ...deleteTodoItemCommands
      ];
      await this.batchDeleteItems(deleteRequests);
      return { listId };
  }

  /**
   * Shares a todo list with users.
   * @param {string} listId - The list ID.
   * @param {object[]} users - The users to share with.
   * @returns {Promise<{ listId: string }>} The shared todo list ID.
   */
  async share(listId, users) {
    const transactItems = users.map(user => ({
      Put: {
        TableName: UserToListTableName,
        Item: {
          [UserToListKey]: user.userId,
          [UserToListSecondaryKey]: listId,
          role: user.role
        },
        ExpressionAttributeNames: {
          '#userId': UserToListKey,
          '#listId': UserToListSecondaryKey
        }
      }
    }));

    const transactCommand = new TransactWriteCommand({
      TransactItems: transactItems
    });
    await this.client.send(transactCommand);
    return { listId };
  }

  /**
   * Unshares a todo list from a user.
   * @param {string} listId - The list ID.
   * @param {string} userId - The user ID.
   * @returns {Promise<{ listId: string, userId: string }>} The unshared todo list ID and user ID.
   */
  async unshare(listId, userId) {
    const command = new DeleteCommand({
      TableName: UserToListTableName,
      Key: {
        [UserToListKey]: userId,
        [UserToListSecondaryKey]: listId
      },
      ConditionExpression: 'attribute_exists(#userId) AND attribute_exists(#listId)',
      ExpressionAttributeNames: {
        '#userId': UserToListKey,
        '#listId': UserToListSecondaryKey
      }
    });
    await this.client.send(command);
    return { listId, userId };
  }

  /**
   * Batch deletes items from the database.
   * @param {object[]} items - The items to delete.
   * @returns {Promise<void>}
   */
  async batchDeleteItems(items) {
    const batches = [];
    while (items.length > 0) {
      batches.push(items.splice(0, 25));
    }
    for (const batch of batches) {
      const transactCommand = new TransactWriteCommand({
        TransactItems: batch.map(item => ({
          Delete: {
            TableName: item.TableName,
            Key: item.Key
          }
        }))
      });
      await this.client.send(transactCommand);
    }
  }
}

module.exports = TodoListRepository;