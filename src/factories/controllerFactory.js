const UserController = require('../controllers/userController');
const TodoController = require('../controllers/todoController');
const TodoListController = require('../controllers/todoListController');
const { createUserService, createTodoService, createTodoListService } = require('./serviceFactory');

/**
 * The instance of the user controller.
 * @type {UserController}
 */
let userControllerInstance;

/**
 * The instance of the todo controller.
 * @type {TodoController}
 */
let todoControllerInstance;

/**
 * The instance of the todo list controller.
 * @type {TodoListController}
 */
let todoListControllerInstance;

/**
 * Creates an instance of the user controller.
 * @returns {UserController} The user controller instance.
 */
const createUserController = () => {
  if (!userControllerInstance) {
    const userService = createUserService();
    userControllerInstance = new UserController(userService);
  }
  return userControllerInstance;
};

/**
 * Creates an instance of the todo controller.
 * @returns {TodoController} The todo controller instance.
 */
const createTodoController = () => {
  if (!todoControllerInstance) {
    const todoService = createTodoService();
    todoControllerInstance = new TodoController(todoService);
  }
  return todoControllerInstance;
};

/**
 * Creates an instance of the todo list controller.
 * @returns {TodoListController} The todo list controller instance.
 */
const createTodoListController = () => {
  if (!todoListControllerInstance) {
    const todoListService = createTodoListService();
    todoListControllerInstance = new TodoListController(todoListService);
  }
  return todoListControllerInstance;
};

module.exports = {
  createUserController,
  createTodoController,
  createTodoListController
};