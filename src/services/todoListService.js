/**
 * Service class for managing todo lists.
 */
class TodoListService {
  /**
   * Creates an instance of TodoListService.
   * @param {TodoListRepository} todoListRepository - The repository for todo lists.
   * @param {IdGenerator} idGenerator - The ID generator.
   */
  constructor(todoListRepository, idGenerator) {
    /** @type {import('../repositories/todoListRepository')} */
    this.todoListRepository = todoListRepository;
    /** @type {import('../services/idGenerator')} */
    this.idGenerator = idGenerator;
  }

  /**
   * Finds the user to list keys.
   * @param {string} userId - The ID of the user.
   * @param {string} listId - The ID of the list.
   * @returns {Promise} A promise that resolves with the user to list keys.
   */
  async findUserToListKeys(userId, listId) {
    return this.todoListRepository.findUserToListKeys(userId, listId);
  }

  /**
   * Gets the todo lists for a user.
   * @param {string} userId - The ID of the user.
   * @param {boolean} includeTodos - Whether to include todos in the response.
   * @returns {Promise} A promise that resolves with the todo lists.
   */
  async getTodoLists(userId, includeTodos) {
    const todoLists = await this.todoListRepository.findByUserId(userId);
    if (includeTodos) {
      for (const list of todoLists) {
        list.todos = await this.todoListRepository.findTodosByListId(list.listId);
      }
    }
    return todoLists;
  }

  /**
   * Gets a todo list by its ID.
   * @param {string} listId - The ID of the list.
   * @param {boolean} includeTodos - Whether to include todos in the response.
   * @returns {Promise} A promise that resolves with the todo list.
   */
  async getTodoListById(listId, includeTodos, options = {}) {
    const todoList = await this.todoListRepository.findById(listId);
    if (todoList && includeTodos) {
      todoList.todos = await this.todoListRepository.findTodosByListId(listId, options);
    }
    return todoList;
  }

  /**
   * Creates a new todo list.
   * @param {string} userId - The ID of the user.
   * @param {object} todoListData - The data for the todo list.
   * @returns {Promise} A promise that resolves with the created todo list.
   */
  async createTodoList(userId, todoListData) {
    todoListData.listId = todoListData.listId || this.idGenerator.generateUUIDv4(); // Generate a unique ID if not provided
    await this.todoListRepository.create(userId, todoListData);
    return todoListData;
  }

  /**
   * Updates a todo list.
   * @param {string} listId - The ID of the list.
   * @param {object} updateData - The data to update the todo list with.
   * @returns {Promise} A promise that resolves with the updated todo list.
   */
  async updateTodoList(listId, updateData) {
    return this.todoListRepository.update(listId, updateData);
  }

  /**
   * Deletes a todo list.
   * @param {string} listId - The ID of the list.
   * @param {string} userId - The ID of the user.
   * @returns {Promise} A promise that resolves when the todo list is deleted.
   */
  async deleteTodoList(listId, userId) {
    return this.todoListRepository.delete(listId, userId);
  }

  /**
   * Shares a todo list with users.
   * @param {string} listId - The ID of the list.
   * @param {Array} users - The users to share the list with.
   * @returns {Promise} A promise that resolves when the list is shared.
   */
  async shareTodoList(listId, users) {
    return this.todoListRepository.share(listId, users);
  }

  /**
   * Unshares a todo list from a user.
   * @param {string} listId - The ID of the list.
   * @param {string} userId - The ID of the user to unshare the list from.
   * @returns {Promise} A promise that resolves when the list is unshared.
   */
  async unshareTodoList(listId, userId) {
    return this.todoListRepository.unshare(listId, userId);
  }
}

module.exports = TodoListService;