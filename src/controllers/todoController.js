/**
 * Controller class for handling Todo operations.
 */
class TodoController {
    /**
     * Creates an instance of TodoController.
     * @param {import('../services/todoService')} todoService - The TodoService instance.
     */
    constructor(todoService) {
        /** @type {import('../services/todoService')} */ 
        this.todoService = todoService;
        this.getTodos = this.getTodos.bind(this);
        this.getTodoById = this.getTodoById.bind(this);
        this.createTodo = this.createTodo.bind(this);
        this.updateTodo = this.updateTodo.bind(this);
        this.deleteTodo = this.deleteTodo.bind(this);
    }

    /**
     * Get all Todos for a specific list.
     * @param {Object} req - The request object.
     * @param {Object} res - The response object.
     * @returns {Promise<void>} - A Promise that resolves when the operation is complete.
     */
    async getTodos(req, res) {
        try {
            const todos = await this.todoService.getTodos(req.params.lid);
            res.json(todos);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    /**
     * Get a specific Todo by its ID.
     * @param {Object} req - The request object.
     * @param {Object} res - The response object.
     * @returns {Promise<void>} - A Promise that resolves when the operation is complete.
     */
    async getTodoById(req, res) {
        try {
            const todo = await this.todoService.getTodoById(req.params.lid, req.params.todoid);
            if (todo) {
                res.json(todo);
            } else {
                res.status(404).json({ error: 'Todo not found' });
            }
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    /**
     * Create a new Todo.
     * @param {Object} req - The request object.
     * @param {Object} res - The response object.
     * @returns {Promise<void>} - A Promise that resolves when the operation is complete.
     */
    async createTodo(req, res) {
        try {
            const todo = await this.todoService.createTodo(req.params.lid, req.body);
            res.status(201).json(todo);
        } catch (error) {
            if (error.name === 'ConditionalCheckFailedException') {
                res.status(409).json({ error: 'Todo item already exists' });
            } else {
                res.status(500).json({ error: error.message });
            }
        }
    }

    /**
     * Update an existing Todo.
     * @param {Object} req - The request object.
     * @param {Object} res - The response object.
     * @returns {Promise<void>} - A Promise that resolves when the operation is complete.
     */
    async updateTodo(req, res) {
        try {
            await this.todoService.updateTodo(req.params.lid, req.params.todoid, req.body);
            res.status(200).json({ message: 'Todo item updated successfully' });
        } catch (error) {
            if (error.name === 'ConditionalCheckFailedException') {
                res.status(404).json({ error: 'Todo item not found' });
            } else {
                res.status(500).json({ error: error.message });
            }
        }
    }

    /**
     * Delete a Todo.
     * @param {Object} req - The request object.
     * @param {Object} res - The response object.
     * @returns {Promise<void>} - A Promise that resolves when the operation is complete.
     */
    async deleteTodo(req, res) {
        try {
            await this.todoService.deleteTodo(req.params.lid, req.params.todoid);
            res.status(204).json({ message: 'Todo item deleted successfully' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = TodoController;