const { Router } = require('@awaitjs/express');

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, QueryCommand, DeleteCommand, UpdateCommand, TransactWriteCommand, GetCommand } = require('@aws-sdk/lib-dynamodb');

const todo = require('../resources/todo');

const dbUtil = require('../resources/dbUtil');

const { userListPermission } = require('../resources/userPermission');

const {
  UserToListTableName,
  UserToListKey,
  UserToListSecondaryKey,
  TodoListTableName,
  TodoListKey,
  TodoTableName, 
  TodoKey,
  TodoSecondaryKey
} = require('../config');

const _ = require('lodash-contrib');

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);
const router = Router({ mergeParams: true });

router.use('/:lid', userListPermission([0,1]));

// Get all todo lists under a user.
router.getAsync('/', async (req, res) => {
  const includeTodos = req.query.includeTodos === 'true';

  const commnad = new QueryCommand({
    TableName: UserToListTableName,
    KeyConditionExpression: '#u = :u',
    ExpressionAttributeNames: {
      '#u': UserToListKey
    },
    ExpressionAttributeValues: {
      ':u': req.params.id
    }
  });

  const response = await docClient.send(commnad);
  const todoLists = response.Items;
  // const items = response.Items.map((record) => _.omit(record, [UserToListKey]));


  const listDetailsPromises = todoLists.map(async (list) => {
    const listCommand = new GetCommand({
      TableName: TodoListTableName,
      Key: {
        [TodoListKey]: list.listId
      }
    });

    const todoList = await docClient.send(listCommand);
    list.title = todoList.Item.title;
    list.description = todoList.Item.description;
    return list;
  });

  const listsWithDetails = await Promise.all(listDetailsPromises);

  if (!includeTodos) {
    return res.send(listsWithDetails); // Return TODO lists without TODOs
  }
  // Step 2: Get all TODOs for each TODO list
  const todoPromises = todoLists.map(async (list) => {
    const todoCommand = new QueryCommand({
      TableName: TodoTableName,
      KeyConditionExpression: '#u = :u',
      ExpressionAttributeNames: {
        '#u': TodoKey
      },
      ExpressionAttributeValues: {
        ':u': list.listId
      }
    });

    const todoData = await docClient.send(todoCommand);
    list.todos = todoData.Items.map((record) => _.omit(record, [TodoKey]));;
    return list;
  });

  const results = await Promise.all(todoPromises);
  res.send(results);
});

// Get a todo list under a user.
router.getAsync('/:lid', userListPermission([0,1,2]), async (req, res) => {
  const includeTodos = req.query.includeTodos === 'true';
  const listId = req.params.lid;
  
  const getTodoListCommand = new GetCommand({
    TableName: TodoListTableName,
    Key: {
      [TodoListKey]: listId
    }
  });

  const response = await docClient.send(getTodoListCommand);
  const todoList = response.Item;
  // const items = response.Items.map((record) => _.omit(record, [UserToListKey]));

  if (!includeTodos) {
    return res.send(todoList); // Return TODO lists without TODOs
  }
  // Step 2: Get all TODOs for the TODO list
 
  const todoCommand = new QueryCommand({
    TableName: TodoTableName,
    KeyConditionExpression: '#u = :u',
    ExpressionAttributeNames: {
      '#u': TodoKey
    },
    ExpressionAttributeValues: {
      ':u': listId
    }
  });

  const todoData = await docClient.send(todoCommand);
  todoList.todos = todoData.Items.map((record) => _.omit(record, [TodoKey]));;
  res.send(todoList);
});


// create a todo list
router.postAsync('/', async (req, res) => {
  try {
    const username = req.params.id;
    const listId = req.body.listId;
    if (!listId) {
      res.send(400, 'Missing lid');
      return;
    }

    const todoListItem = req.body;
    const userToListItem  = { role: 0 };
    userToListItem[UserToListKey] = username;
    userToListItem[UserToListSecondaryKey] = listId;

    // Use TransactWriteItems to ensure atomicity
    const transactCommand = new TransactWriteCommand({
      TransactItems: [
        {
          Put: {
            TableName: TodoListTableName,
            Item: todoListItem,
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
    await docClient.send(transactCommand);      
    res.status(201).json({ 
      [TodoListKey]: listId
    });
  } catch (error) {
    console.log('Upsert todo item error:', error);
    res.send(500, error);
  }
});

// update a todo list
router.putAsync('/:lid', async (req, res) => {
  try {
    const listId = req.params.lid;
    const updateData = req.body;
    const updateParam = dbUtil.composeUpdateRequest(listId, null, updateData, TodoListTableName, TodoListKey, null);
    // Send the update request
    const updateCommand = new UpdateCommand(updateParam);
    await docClient.send(updateCommand);
    res.status(200).json({ message: 'Todo list updated successfully' });
  } catch (error) {
    if (error.name === 'ConditionalCheckFailedException') {
      res.status(404).json({ error: 'Todo list not found' });
    } else {
      console.log('Update todo list error:', error);
      res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
  }
});

router.deleteAsync('/:lid', userListPermission([0]), async (req, res) => {
  try {
    const listId = req.params.lid;
    const todoItems = await fetchAllTodoItems(listId);

    const deleteTodoItems = todoItems.map(item => ({
      TableName: TodoTableName,
      Key: {
        [TodoKey]: item[TodoKey],
        [TodoSecondaryKey]: item[TodoSecondaryKey]
      }
    }));

    const deleteRequests = [
      {
        TableName: TodoListTableName,
        Key: {
          [TodoListKey]: listId
        }
      },
      {
        TableName: UserToListTableName,
        Key: req.userToListKeys
      },
      ...deleteTodoItems
    ];
    // Batch delete items
    await batchDeleteItems(deleteRequests);
    res.status(204).json({ message: 'Todo list deleted successfully' });
  } catch (error) {
    if (error.name === 'ConditionalCheckFailedException') {
      res.status(400).json({ error: 'Item does not exist' });
    } else {
      console.log('Delete todo item error:', error);
      res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
  }
});

//add/update shared users
router.postAsync('/:lid/share', userListPermission([0]), async (req, res) => {
  try {
    const listId = req.params.lid;
    const users = req.body; // Assuming the request body contains the new user's ID and the role

    // Validate each user object
    for (const user of users) {
      console.log('User:', user);
      if (user.userId == null || user.role == null) {
        console.log('caught here:', user.userId + ' ' + user.role );
        return res.status(400).json({ error: 'Each user must have a userId and a role' });
      }
    }

    // Prepare the transact write items for adding each user
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
    await docClient.send(transactCommand);
    res.status(200).json({ message: 'Todo list shared successfully' });
  } catch (error) {
    console.log('Share TODO list error:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
});

// remove a shared user
router.deleteAsync('/:lid/share/:shareuserid', userListPermission([0]), async (req, res) => {
  try {
    const listId = req.params.lid;
    const userId = req.params.shareuserid;

    const deleteCommand = new DeleteCommand({
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

    await docClient.send(deleteCommand);
    res.status(204).json({ message: 'User removed from shared todo list successfully' });
  } catch (error) {
    if (error.name === 'ConditionalCheckFailedException') {
      res.status(404).json({ error: 'User not found in shared TODO list' });
    } else {
      console.log('Delete shared user error:', error);
      res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
  }
});


// Helper function to batch delete items
const batchDeleteItems = async (items) => {
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
    await docClient.send(transactCommand);
  }
};

const fetchAllTodoItems = async (listId) => {
  const todoQueryCommand = new QueryCommand({
    TableName: TodoTableName,
    KeyConditionExpression: '#listId = :listId',
    ExpressionAttributeNames: {
      '#listId': TodoListKey
    },
    ExpressionAttributeValues: {
      ':listId': listId
    }
  });
  const todoData = await docClient.send(todoQueryCommand);
  return todoData.Items;
};

router.use('/:lid/todo', todo);

module.exports = router;