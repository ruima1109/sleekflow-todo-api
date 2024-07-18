/**
 * Controller class for managing todo lists.
 */
class TodoListController {
  /**
   * Creates an instance of TodoListController.
   * @param {TodoListService} todoListService - The todo list service.
   */
  constructor(todoListService) {
    /** @type {import('../services/todoListService')} */
    this.todoListService = todoListService;
    this.getTodoLists = this.getTodoLists.bind(this);
    this.getTodoListById = this.getTodoListById.bind(this);
    this.createTodoList = this.createTodoList.bind(this);
    this.updateTodoList = this.updateTodoList.bind(this);
    this.deleteTodoList = this.deleteTodoList.bind(this);
    this.shareTodoList = this.shareTodoList.bind(this);
    this.unshareTodoList = this.unshareTodoList.bind(this);
  }

  /**
   * Get all todo lists.
   * @param {Object} req - The request object.
   * @param {Object} res - The response object.
   * @returns {Promise<void>} - A promise that resolves with the todo lists.
   */
  async getTodoLists(req, res) {
    try {
      const todoLists = await this.todoListService.getTodoLists(req.params.id, req.query.includeTodos === 'true');
      res.json(todoLists);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Get a todo list by ID.
   * @param {Object} req - The request object.
   * @param {Object} res - The response object.
   * @returns {Promise<void>} - A promise that resolves with the todo list.
   */
  async getTodoListById(req, res) {
    try {
      const options = {
        filters: {
          status: req.query.status,
          dueDate: req.query.dueDate
        },
        sortBy: req.query.sortBy,
        sortOrder: req.query.sortOrder
      };
      const todoList = await this.todoListService.getTodoListById(req.params.lid, req.query.includeTodos === 'true', options);
      if (todoList) {
        res.json(todoList);
      } else {
        res.status(404).json({ error: 'Todo list not found' });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Create a new todo list.
   * @param {Object} req - The request object.
   * @param {Object} res - The response object.
   * @returns {Promise<void>} - A promise that resolves with the created todo list.
   */
  async createTodoList(req, res) {
    try {
      const todoList = await this.todoListService.createTodoList(req.params.id, req.body);
      res.status(201).json(todoList);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Update a todo list.
   * @param {Object} req - The request object.
   * @param {Object} res - The response object.
   * @returns {Promise<void>} - A promise that resolves when the todo list is updated.
   */
  async updateTodoList(req, res) {
    try {
      await this.todoListService.updateTodoList(req.params.lid, req.body);
      res.status(200).json({ message: 'Todo list updated successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Delete a todo list.
   * @param {Object} req - The request object.
   * @param {Object} res - The response object.
   * @returns {Promise<void>} - A promise that resolves when the todo list is deleted.
   */
  async deleteTodoList(req, res) {
    try {
      await this.todoListService.deleteTodoList(req.params.lid, req.params.id);
      res.status(204).json({ message: 'Todo list deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Share a todo list with another user.
   * @param {Object} req - The request object.
   * @param {Object} res - The response object.
   * @returns {Promise<void>} - A promise that resolves when the todo list is shared.
   */
  async shareTodoList(req, res) {
    try {
      await this.todoListService.shareTodoList(req.params.lid, req.body);
      res.status(200).json({ message: 'Todo list shared successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Remove a user from a shared todo list.
   * @param {Object} req - The request object.
   * @param {Object} res - The response object.
   * @returns {Promise<void>} - A promise that resolves when the user is removed from the shared todo list.
   */
  async unshareTodoList(req, res) {
    try {
      await this.todoListService.unshareTodoList(req.params.lid, req.params.shareuserid);
      res.status(204).json({ message: 'User removed from shared todo list successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = TodoListController;