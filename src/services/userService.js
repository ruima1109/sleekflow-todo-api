/**
 * Represents a service for managing users.
 */
class UserService {

  /**
   * Creates an instance of UserService.
   * @param {UserRepository} userRepository - The user repository.
   */
  constructor(userRepository) {
    /** @type  {import('../repositories/userRepository')} */
    this.userRepository = userRepository;
  }

  /**
   * Retrieves users by list ID.
   * @param {string} listId - The ID of the list.
   * @returns {Promise<Array>} - A promise that resolves to an array of users.
   */
  async getUsersByList(listId) {
    return this.userRepository.getUsersByList(listId);
  }

}

module.exports = UserService;