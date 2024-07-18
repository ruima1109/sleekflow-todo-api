const express = require('express');
const todoListRoutes = require('./todoListRoutes');
const { userAuthPermission } = require('./middlewares/userPermission');
const { DisableAwsAuth } = require('../config');
const { createUserController } = require('../factories/controllerFactory');
const router = express.Router();

/** @type {import('../controllers/userController')} */ 
const userController = createUserController();

if (!DisableAwsAuth) {
  router.use('/:id', userAuthPermission);
}

router.get('/getUsersBylist', userController.getUsersByList);
router.get('/:id', (req, res) => {
  res.json({
    userId: req.params.id,
    env: process.env.NODE_ENV
  });
});

router.use('/:id/todo-lists', todoListRoutes);

module.exports = router;