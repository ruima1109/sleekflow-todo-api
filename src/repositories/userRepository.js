const { QueryCommand } = require('@aws-sdk/lib-dynamodb');
const { UserToListTableName, UserToListSecondaryKey } = require('../config');

/**
 * Class representing a user repository.
 */
class UserRepository {

    /**
     * Create a user repository.
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
     * Get users by list ID.
     * @param {string} listId - The ID of the list.
     * @returns {Promise<Array>} - The array of users.
     */
    async getUsersByList(listId) {
        const command = new QueryCommand({
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

        const response = await this.client.send(command);
        return response.Items;
    }
}

module.exports = UserRepository;