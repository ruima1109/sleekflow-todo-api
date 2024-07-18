const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient } = require('@aws-sdk/lib-dynamodb');

/**
 * A class representing a database manager for DynamoDB.
 */
class DatabaseManager {
    constructor() {
        const client = new DynamoDBClient({});
        this.docClient = DynamoDBDocumentClient.from(client);
    }

    /**
     * Get the DynamoDB document client.
     * @returns {DynamoDBDocumentClient} The DynamoDB document client.
     */
    getClient() {
        return this.docClient;
    }
}

module.exports = DatabaseManager;