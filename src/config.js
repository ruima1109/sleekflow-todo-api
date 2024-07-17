// We use the [config]{@link https://www.npmjs.com/package/config} module to manage configurations.
// It supports config hierarchy and overriding. The rules of loading configuration files are defined here https://github.com/lorenwest/node-config/wiki/Configuration-Files
// The running environment is set through NODE_ENV by scripts in package.json

const config = require('config');

module.exports = {
  TodoTableName: config.get('dynamoDB.todoDB.tableName'),
  TodoKey: config.get('dynamoDB.todoDB.primaryKey'),
  TodoSecondaryKey: config.get('dynamoDB.todoDB.secondaryKey'),
  TodoListTableName: config.get('dynamoDB.todoListDB.tableName'),
  TodoListKey: config.get('dynamoDB.todoListDB.primaryKey'),
  UserToListTableName: config.get('dynamoDB.userToListDB.tableName'),
  UserToListKey: config.get('dynamoDB.userToListDB.primaryKey'),
  UserToListSecondaryKey: config.get('dynamoDB.userToListDB.secondaryKey'),
  UserToListListIndexName: config.get('dynamoDB.userToListDB.listIndexName'),
  TodoAppSyncAPIURL: config.get('todoAppSyncAPI.url'),
  DisableAwsAuth: config.get('auth.disableAwsAuth'),
  DebugMode: config.get('debugMode') // when this is on, print more data in console
};
