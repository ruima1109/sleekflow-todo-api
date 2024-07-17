const AWS = require('aws-sdk');
const appsync = require('aws-appsync');
const gql = require('graphql-tag');
const _ = require('lodash');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, QueryCommand } = require('@aws-sdk/lib-dynamodb');

const {
  DebugMode,
  TodoAppSyncAPIURL,
  UserToListTableName,
  UserToListKey,
  UserToListSecondaryKey,
  UserToListListIndexName,
  TodoTableName,
  TodoKey
} = require('./config');

const EventSource = {
  TODO: 1,
  USER_TO_LIST: 2,
  UNKNOWN: 100
};

const todDoitemFields = [
  'listId',
  'todoId',
  'description',
  'dueDate',
  'name',
  'status'
];

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);


const getUsersByList = async (listId) => {
  
  const commnad = new QueryCommand({
    TableName: UserToListTableName,
    IndexName: UserToListListIndexName,
    KeyConditionExpression: '#lid = :lid',
    ExpressionAttributeNames: {
      '#lid': UserToListSecondaryKey
    },
    ExpressionAttributeValues: {
      ':lid': listId
    }
  });

  const response = await docClient.send(commnad);
  const userIds = response.Items.map(userToLists => userToLists.userId);

  console.log(`Found users: ${JSON.stringify(userIds)}`);
  return userIds;
};

const userToListFields = ['listId', 'userId', 'role'];

const getEventSource = (source) => {
  if (source.includes(`table/${UserToListTableName}`)) {
    return EventSource.USER_TO_LIST;
  }
  if (source.includes(`table/${TodoTableName}`)) {
    return EventSource.TODO;
  }
  return EventSource.UNKNOWN;
};


const todoMutationGql = gql(
  `mutation onTodoItemChange($username: String!, $item: TodoItemChangeInput!, $type: String!) {
    onTodoItemChange (username: $username, item: $item, type: $type) {
      item {
        ${_.join(todDoitemFields, '\n')}
      }
      type
      username
    }
  }`
);

const userToListMutationGql = gql(
  `mutation onUserToListChange($username: String!, $item: UserToListChangeInput!, $type: String!) {
    onUserToListChange (username: $username, item: $item, type: $type) {
      item {
        ${_.join(userToListFields, '\n')}
      }
      type
      username
    }
  }`
);

const graphqlClient = new appsync.AWSAppSyncClient({
  url: TodoAppSyncAPIURL,
  region: AWS.config.region,
  auth: {
    type: 'AWS_IAM',
    credentials: AWS.config.credentials
  },
  disableOffline: true
});

const notifyAppSync = async (keys, typeInput, itemInput, eventSource) => {

  if (eventSource === EventSource.TODO) {
    todoItemOnChanged(keys, typeInput, itemInput);
  } else if (eventSource === EventSource.USER_TO_LIST) {
    userToListOnChanged(keys, typeInput, itemInput);
  }
};

const todoItemOnChanged = async (keys, typeInput, itemInput) => {
  try {
    const userIds = await getUsersByList(keys[TodoKey]);
    const mutationPromises = userIds.map(userId => {
      return graphqlClient.mutate({
        mutation: todoMutationGql,
        variables: {
          username: userId,
          type: typeInput,
          item: itemInput
        }
      });
    });
    await Promise.all(mutationPromises);
    console.log('Successfully notify the subscription');
  } catch (error) {
    console.log('Failed to call AppSync:', error);
  }
};

const userToListOnChanged = async (keys, typeInput, itemInput) => {
  try {
    await graphqlClient.mutate({
      mutation: userToListMutationGql,
      variables: {
        username: keys[UserToListKey],
        type: typeInput,
        item: itemInput
      }
    });
    console.log('Successfully notify the subscription');
  } catch (error) {
    console.log('Failed to call AppSync:', error);
  }
};

module.exports.handler = (event) => {
  const records = event.Records;
  console.log(`New ${records.length} records coming...`);
  if (DebugMode) {
    console.log(`Records: ${JSON.stringify(event)}`);
  }
  records.forEach((record) => {
    try {
      const keys = AWS.DynamoDB.Converter.unmarshall(record.dynamodb.Keys);
      let newItem;
      let oldItem;
      const eventSource = getEventSource(record.eventSourceARN);
      if (eventSource === EventSource.UNKNOWN) {
        console.log('Unrecognized event source');
        return;
      }
      if (record.dynamodb.NewImage) {
        newItem = AWS.DynamoDB.Converter.unmarshall(record.dynamodb.NewImage);
        // newItem = normalizeItem(newItem, eventSource);
      }
      if (record.dynamodb.OldImage) {
        oldItem = AWS.DynamoDB.Converter.unmarshall(record.dynamodb.OldImage);
        // oldItem = normalizeItem(oldItem, eventSource);
      }

      if (newItem && oldItem && _.isEqual(newItem, oldItem)) {
        console.log('No changes are made on subscribed fields');
        return;
      }
      const item = newItem || oldItem;
      console.log(`Parsed items: ${JSON.stringify(item)}`);
      notifyAppSync(keys, record.eventName, item, eventSource);
    } catch (error) {
      console.log(
        `Failed to parse or update the event. Error: ${error}, Event: ${event}`
      );
    }
  });
};
