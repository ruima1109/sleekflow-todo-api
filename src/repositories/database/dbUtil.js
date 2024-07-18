const AWS = require('aws-sdk');
/**
 * Utility class for interacting with the database.
 */
class DBUtil {
    /**
     * Composes an update request for the database.
     * @param {string} primaryKey - The primary key value.
     * @param {string} sortKey - The sort key value.
     * @param {object} item - The item to be updated.
     * @param {string} tableName - The name of the table.
     * @param {string} primaryKeyName - The name of the primary key attribute.
     * @param {string} sortKeyName - The name of the sort key attribute.
     * @returns {object} - The update request object.
     */
    static composeUpdateRequest(primaryKey, sortKey, item, tableName, primaryKeyName, sortKeyName) {
        let updateExpression = 'set';
        const expressionAttributeNames = {};
        const expressionAttributeValues = {};

        Object.keys(item).forEach((property) => {
            updateExpression += ` #${property} = :${property},`;
            expressionAttributeNames[`#${property}`] = property;
            expressionAttributeValues[`:${property}`] = item[property];
        });

        updateExpression = updateExpression.slice(0, -1);

        const key = {
            [primaryKeyName]: primaryKey
        };

        if (sortKey && sortKeyName) {
            key[sortKeyName] = sortKey;
        }

        const conditionExpression = `attribute_exists(${primaryKeyName})` + (sortKeyName ? ` AND attribute_exists(${sortKeyName})` : '');

        return {
            TableName: tableName,
            Key: key,
            UpdateExpression: updateExpression,
            ExpressionAttributeNames: expressionAttributeNames,
            ExpressionAttributeValues: expressionAttributeValues,
            ConditionExpression: conditionExpression
        };
    }

    /**
     * Converts a DynamoDB item to its JavaScript object representation.
     *
     * @param {Object} dynamoDBItem - The DynamoDB item to be unmarshalled.
     * @returns {Object} - The unmarshalled DAO object.
     */
    static unmarshallDynamoDBItem(dynamoDBItem) {
        return AWS.DynamoDB.Converter.unmarshall(dynamoDBItem);
    }
}

module.exports = DBUtil;