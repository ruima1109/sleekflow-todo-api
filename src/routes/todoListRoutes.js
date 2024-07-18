const express = require('express');
const todoRoutes = require('./todoRoutes');
const { userListPermission } = require('./middlewares/userPermission');
const { createTodoListController } = require('../factories/controllerFactory');
const { createTodoListService } = require('../factories/serviceFactory');

const router = express.Router({ mergeParams: true });

/** @type {import('../controllers/todoListController')} */
const todoListController = createTodoListController();
const todoListService = createTodoListService();

router.get('/', todoListController.getTodoLists);
router.get('/:lid', userListPermission(todoListService, [0,1,2]), todoListController.getTodoListById);
router.post('/', todoListController.createTodoList);
router.put('/:lid', userListPermission(todoListService, [0,1]), todoListController.updateTodoList);
router.delete('/:lid', userListPermission(todoListService, [0]), todoListController.deleteTodoList);
router.post('/:lid/share', userListPermission(todoListService, [0]), todoListController.shareTodoList);
router.delete('/:lid/share/:shareuserid', userListPermission(todoListService, [0]), todoListController.unshareTodoList);
router.use('/:lid/todo', todoRoutes);

module.exports = router;