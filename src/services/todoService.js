/**
 * Service class for managing todos.
 */
class TodoService {

    /**
     * Creates an instance of TodoService.
     * @param {import('../repositories/todoListRepository')} todoRepository - The todo repository.
     * @param {import('../services/idGenerator')} idGenerator - The ID generator service.
     */
    constructor(todoRepository, idGenerator) {
        this.todoRepository = todoRepository;
        this.idGenerator = idGenerator;
    }

    /**
     * Retrieves all todos for a given list.
     * @param {string} listId - The ID of the list.
     * @returns {Promise<Array>} A promise that resolves to an array of todos.
     */
    async getTodos(listId) {
        return this.todoRepository.findAllByListId(listId);
    }

    /**
     * Retrieves a todo by its ID.
     * @param {string} listId - The ID of the list.
     * @param {string} todoId - The ID of the todo.
     * @returns {Promise<Object>} A promise that resolves to the todo object.
     */
    async getTodoById(listId, todoId) {
        return this.todoRepository.findById(listId, todoId);
    }

    /**
     * Creates a new todo.
     * @param {string} listId - The ID of the list.
     * @param {Object} todoData - The data for the new todo.
     * @returns {Promise<Object>} A promise that resolves to the created todo object.
     */
    async createTodo(listId, todoData) {
        todoData.todoId = todoData.todoId || this.idGenerator.generateUUIDv4();
        return this.todoRepository.create(listId, todoData);
    }

    /**
     * Updates a todo.
     * @param {string} listId - The ID of the list.
     * @param {string} todoId - The ID of the todo.
     * @param {Object} updateData - The data to update the todo with.
     * @returns {Promise<Object>} A promise that resolves to the updated todo object.
     */
    async updateTodo(listId, todoId, updateData) {
        return this.todoRepository.update(listId, todoId, updateData);
    }

    /**
     * Deletes a todo.
     * @param {string} listId - The ID of the list.
     * @param {string} todoId - The ID of the todo.
     * @returns {Promise<boolean>} A promise that resolves to true if the todo was deleted successfully, false otherwise.
     */
    async deleteTodo(listId, todoId) {
        return this.todoRepository.delete(listId, todoId);
    }
}

module.exports = TodoService;