const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand } = require('@aws-sdk/lib-dynamodb');

const {
  UserToListTableName,
  UserToListKey,
  UserToListSecondaryKey
} = require('../config');

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

// AWS user permission check middleware
const userAuthPermission = (req, res, next) => {
  const awsUsername = req.apiGateway?.event?.requestContext?.authorizer?.claims?.['cognito:username'];
  const reqUsername = req.params?.id;

  if (awsUsername !== reqUsername) {
    console.error(`Invalid user request aws username: ${awsUsername}, req username: ${reqUsername}`);
    return res.status(401).send('The request is not authorized.');
  }
  next();
};


const userListPermission = (allowedRoles) => {
  return async (req, res, next) => {
    try {
      const username = req.params.id;
      const listId = req.params.lid;;

      if (!listId) {
        return res.status(400).json({ error: 'Missing list ID' });
      }

      const userToListKeys = {
        [UserToListKey]: username,
        [UserToListSecondaryKey]: listId
      };

      const getUserToListCommand = new GetCommand({
        TableName: UserToListTableName,
        Key: userToListKeys
      });

      const userToListData = await docClient.send(getUserToListCommand);

      if (!userToListData.Item || !allowedRoles.includes(userToListData.Item.role)) {
        return res.status(403).json({ error: 'You do not have permission for this list' });
      }
      req.userToListData = userToListData.Item; // Attach user-to-list data to request object
      req.userToListKeys = userToListKeys;
      next();
    } catch (error) {
      console.error('Permission check error:', error);
      res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
  }
};

module.exports = {
  userAuthPermission,
  userListPermission
};