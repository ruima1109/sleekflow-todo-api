const appsync = require('aws-appsync');
const AWS = require('aws-sdk');
const DatabaseManager = require('../repositories/database/databaseManager');
const { TodoAppSyncAPIURL } = require('../config');

/**
 * @fileoverview Factory function for creating a DatabaseManager instance and an AppSyncClient instance.
 * @module factories/datasourceManagerFactory
 */


let dbInstance, appSyncInstance;

/**
 * Creates a DatabaseManager instance if it doesn't exist, and returns the instance.
 * @function createDatabaseManager
 * @returns {DatabaseManager} The DatabaseManager instance.
 */
const createDatabaseManager = () => {
    if (!dbInstance) {
        dbInstance = new DatabaseManager();
    }
    return dbInstance;
};

/**
 * Creates an AppSyncClient instance if it doesn't exist, and returns the instance.
 * @function createAppSyncClient
 * @returns {AWSAppSyncClient} The AppSyncClient instance.
 */
const createAppSyncClient = () => {
    if (!appSyncInstance) {
        appSyncInstance = new appsync.AWSAppSyncClient({
            url: TodoAppSyncAPIURL,
            region: AWS.config.region,
            auth: {
              type: 'AWS_IAM',
              credentials: AWS.config.credentials
            },
            disableOffline: true
        });
    }
    return appSyncInstance;
};

module.exports = {
    createDatabaseManager,
    createAppSyncClient
};