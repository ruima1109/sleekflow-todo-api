const { QueryCommand, GetCommand, PutCommand, UpdateCommand, DeleteCommand } = require('@aws-sdk/lib-dynamodb');
const { TodoTableName, TodoKey, TodoSecondaryKey } = require('../config');
const DBUtil = require('./database/dbUtil');

/**
 * Represents a repository for managing Todo items.
 */
class TodoRepository {

  /**
   * Creates an instance of TodoRepository.
   * @param {DatabaseManager} databaseManager - The database manager instance.
   */
  constructor(databaseManager) {
    /** @type {import('./database/databaseManager')} */
    this.databaseManager = databaseManager;
    /**
     * @type {import('@aws-sdk/lib-dynamodb').DynamoDBDocumentClient}
     */
    this.client = this.databaseManager.getClient();
  }

  /**
   * Finds all Todo items by list ID.
   * @param {string} listId - The ID of the list.
   * @returns {Promise<Array>} - A promise that resolves to an array of Todo items.
   */
  async findAllByListId(listId) {
    const command = new QueryCommand({
      TableName: TodoTableName,
      KeyConditionExpression: '#u = :u',
      ExpressionAttributeNames: {
        '#u': TodoKey
      },
      ExpressionAttributeValues: {
        ':u': listId
      }
    });
    const response = await this.client.send(command);
    return response.Items;
  }

  /**
   * Finds a Todo item by list ID and Todo ID.
   * @param {string} listId - The ID of the list.
   * @param {string} todoId - The ID of the Todo item.
   * @returns {Promise<Object>} - A promise that resolves to the Todo item.
   */
  async findById(listId, todoId) {
    const command = new GetCommand({
      TableName: TodoTableName,
      Key: {
        [TodoKey]: listId,
        [TodoSecondaryKey]: todoId
      }
    });
    const response = await this.client.send(command);
    return response.Item;
  }

  /**
   * Creates a new Todo item.
   * @param {string} listId - The ID of the list.
   * @param {Object} todoData - The data of the Todo item.
   * @returns {Promise<Object>} - A promise that resolves to the created Todo item.
   */
  async create(listId, todoData) {
    const command = new PutCommand({
      TableName: TodoTableName,
      Item: {
        ...todoData,
        [TodoKey]: listId,
        [TodoSecondaryKey]: todoData.todoId
      },
      ConditionExpression: 'attribute_not_exists(#listId) AND attribute_not_exists(#todoId)',
      ExpressionAttributeNames: {
        '#listId': TodoKey,
        '#todoId': TodoSecondaryKey
      }
    });
    await this.client.send(command);
    return todoData;
  }

  /**
   * Updates a Todo item.
   * @param {string} listId - The ID of the list.
   * @param {string} todoId - The ID of the Todo item.
   * @param {Object} updateData - The updated data of the Todo item.
   * @returns {Promise<Object>} - A promise that resolves to the updated Todo item.
   */
  async update(listId, todoId, updateData) {
    const updateParam = DBUtil.composeUpdateRequest(listId, todoId, updateData, TodoTableName, TodoKey, TodoSecondaryKey);
    const command = new UpdateCommand(updateParam);
    await this.client.send(command);
    return { listId, todoId };
  }

  /**
   * Deletes a Todo item.
   * @param {string} listId - The ID of the list.
   * @param {string} todoId - The ID of the Todo item.
   * @returns {Promise<Object>} - A promise that resolves to the deleted Todo item.
   */
  async delete(listId, todoId) {
    const command = new DeleteCommand({
      TableName: TodoTableName,
      Key: {
        [TodoKey]: listId,
        [TodoSecondaryKey]: todoId
      }
    });
    await this.client.send(command);
    return { listId, todoId };
  }
}

module.exports = TodoRepository;