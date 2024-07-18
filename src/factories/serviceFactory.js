const UserService = require('../services/userService');
const UserRepository = require('../repositories/userRepository');
const TodoService = require('../services/todoService');
const TodoRepository = require('../repositories/todoRepository');
const TodoListService = require('../services/todoListService');
const TodoListRepository = require('../repositories/todoListRepository');
const IdGenerator = require('../services/idGenerator');
const AppSyncService = require('../services/appSyncService');

const { createDatabaseManager, createAppSyncClient } = require('./datasourceManagerFactory');

let userServiceInstance, todoServiceIInstance, todoListServiceIInstance, appsyncServiceInstance;

const idGenerator = new IdGenerator();

/**
 * Creates an instance of the UserService class.
 * @returns {UserService} The UserService instance.
 */
const createUserService = () => {
  if (!userServiceInstance) {
    const databaseManager = createDatabaseManager();
    const userRepository = new UserRepository(databaseManager);
    const userService = new UserService(userRepository);
    userServiceInstance = userService;
  }
  return userServiceInstance;
};

/**
 * Creates an instance of the TodoService class.
 * @returns {TodoService} The TodoService instance.
 */
const createTodoService = () => {
  if (!todoServiceIInstance) {
    const databaseManager = createDatabaseManager();
    const todoRepository = new TodoRepository(databaseManager);
    const todoService = new TodoService(todoRepository, idGenerator);
    todoServiceIInstance = todoService;
  }
  return todoServiceIInstance;
};

/**
 * Creates an instance of the TodoListService class.
 * @returns {TodoListService} The TodoListService instance.
 */
const createTodoListService = () => {
  if (!todoListServiceIInstance) {
    const databaseManager = createDatabaseManager();
    const userRepository = new UserRepository(databaseManager);
    const todoListRepository = new TodoListRepository(databaseManager, userRepository);
    const todoListService = new TodoListService(todoListRepository, idGenerator);
    todoListServiceIInstance = todoListService;
  }
  return todoListServiceIInstance;
};

/**
 * Creates an instance of the AppSync service.
 * @returns {AppSyncService} The AppSync service instance.
 */
const createAppSyncService = () => {
  if (!appsyncServiceInstance) {
    const appSyncClient = createAppSyncClient();
    const databaseManager = createDatabaseManager();
    const userRepository = new UserRepository(databaseManager);
    appsyncServiceInstance = new AppSyncService(appSyncClient, userRepository);
  }
  return appsyncServiceInstance;
};

module.exports = {
  createUserService,
  createTodoService,
  createTodoListService,
  createAppSyncService
};