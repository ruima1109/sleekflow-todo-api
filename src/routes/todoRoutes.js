const express = require('express');
const { createTodoController } = require('../factories/controllerFactory');

const router = express.Router({ mergeParams: true });

/** @type {import('../controllers/todoController')} */
const todoController = createTodoController();

router.get('/', todoController.getTodos);
router.get('/:todoid', todoController.getTodoById);
router.post('/', todoController.createTodo);
router.put('/:todoid', todoController.updateTodo);
router.delete('/:todoid', todoController.deleteTodo);

module.exports = router;