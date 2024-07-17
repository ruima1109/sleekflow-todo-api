const { Router } = require('@awaitjs/express');

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, QueryCommand, GetCommand, DeleteCommand, PutCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb');

const { TodoTableName, TodoKey, TodoSecondaryKey } = require('../config');

const _ = require('lodash-contrib');

const dbUtil = require('../resources/dbUtil');

const router = Router({ mergeParams: true });

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

// Get all todos under a list.
router.getAsync('/', async (req, res) => {
  const commnad = new QueryCommand({
    TableName: TodoTableName,
    KeyConditionExpression: '#u = :u',
    ExpressionAttributeNames: {
      '#u': TodoKey
    },
    ExpressionAttributeValues: {
      ':u': req.params.lid
    }
  });
  const response = await docClient.send(commnad);
  const items = response.Items.map((record) => _.omit(record, [TodoKey]));
  res.send(items);
});

// Get a single todo by id.
router.getAsync('/:todoid', async (req, res) => {
  const listId = req.params.lid;
  const todoId = req.params.todoid;
  
  const getTodoCommand = new GetCommand({
    TableName: TodoTableName,
    Key: {
      [TodoKey]: listId,
      [TodoSecondaryKey]: todoId
    }
  });

  const response = await docClient.send(getTodoCommand);
  const todo = response.Item;
  // const items = response.Items.map((record) => _.omit(record, [UserToListKey]));
  if (todo) {
    res.send(todo);
  } else {
    res.sendStatus(404);
  }
});

// Create a todo item.
router.postAsync('/', async (req, res) => {
  try {
    const listId = req.params.lid;
    const itemId = req.body.todoId;

    if (!itemId) {
      res.send(400, 'Missing item id');
      return;
    }

    const todoItem = {
      ...req.body,
      [TodoKey]: listId,
      [TodoSecondaryKey]: itemId
    };

    const putCommand = new PutCommand({
      TableName: TodoTableName,
      Item: todoItem,
      ConditionExpression: 'attribute_not_exists(#listId) AND attribute_not_exists(#todoId)',
      ExpressionAttributeNames: {
        '#listId': TodoKey,
        '#todoId': TodoSecondaryKey
      }
    });

    await docClient.send(putCommand);    
    res.status(201).json({ 
      [TodoKey]: listId,
      [TodoSecondaryKey]: itemId 
    });
  } catch (error) {
    if (error.name === 'ConditionalCheckFailedException') {
      res.status(409).json({ error: 'Todo item already exists' });
    } else {
      console.log('Create todo item error:', error);
      res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
  }
});


// Update a todo item.
router.putAsync('/:todoid', async (req, res) => {
  try {
    const listId = req.params.lid;
    const itemId = req.params.todoid;
    const updateData = req.body;

    const updateParam = dbUtil.composeUpdateRequest(listId, itemId, updateData, 
      TodoTableName, TodoKey, TodoSecondaryKey);

      // Send the update request
    const updateCommand = new UpdateCommand(updateParam);
    await docClient.send(updateCommand);
    res.status(200).json({ message: 'Todo item updated successfully' });
  } catch (error) {
    if (error.name === 'ConditionalCheckFailedException') {
      res.status(404).json({ error: 'Todo item not found' });
    } else {
      console.log('Update todo item error:', error);
      res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
  }
});

// delete a todo item
router.deleteAsync('/:todoid', async (req, res) => {
  try {
    const listId = req.params.lid;
    const todoId = req.params.todoid;

    const deleteTodoCommand = new DeleteCommand({
      TableName: TodoTableName,
      Key: {
        [TodoKey]: listId,
        [TodoSecondaryKey]: todoId
      }
    });
    await docClient.send(deleteTodoCommand);
    res.status(204).json({ message: 'Todo item deleted successfully' });
  } catch (error) {
    console.log('Delete todo item error:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
});



module.exports = router;
