const express = require('express');
const todoList = require('../resources/todoList');
const { userAuthPermission } = require('../resources/userPermission');

const { DisableAwsAuth } = require('../config');

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, QueryCommand } = require('@aws-sdk/lib-dynamodb');

const router = express.Router();


const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);


const {
  UserToListTableName,
  UserToListSecondaryKey
} = require('../config');

// make sure the user can only access to their own resources
if (!DisableAwsAuth) {
  router.use('/:id', userAuthPermission);
}

// Get all users by a list
router.get('/getUsersBylist', async (req, res) => {
  const listId = req.query.listId;

  if (!listId) {
    res.send(400, 'Missing list id');
    return;
  }
  
  const commnad = new QueryCommand({
    TableName: UserToListTableName,
    IndexName: 'listId-index',
    KeyConditionExpression: '#lid = :lid',
    ExpressionAttributeNames: {
      '#lid': UserToListSecondaryKey
    },
    ExpressionAttributeValues: {
      ':lid': listId
    }
  });

  const response = await docClient.send(commnad);
  const userToLists = response.Items;

  res.send(userToLists);
});

// Get user info
router.get('/:id', (req, res) => {
  console.log(req);
  res.json({
    userId: req.params.id,
    env: process.env.NODE_ENV
  });
});


router.use('/:id/todo-lists', todoList);
module.exports = router;
