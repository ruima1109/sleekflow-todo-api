const gql = require('graphql-tag');
const _ = require('lodash');
/**
 * Represents a service for interacting with AWS AppSync.
 */
class AppSyncService {

  /**
   * Creates an instance of AppSyncService.
   * @param {import('aws-appsync').AWSAppSyncClient} graphqlClient - The AppSync client.
   * @param {import('../repositories/userRepository')} userRepository - The user repository.
   */
  constructor(graphqlClient, userRepository) {
    /** @type {import('../repositories/userRepository')} */
    this.userRepository = userRepository;

    /** @type {import('aws-appsync').AWSAppSyncClient} */
    this.graphqlClient = graphqlClient;

    this.todoMutationGql = gql(
      `mutation onTodoItemChange($username: String!, $item: TodoItemChangeInput!, $type: String!) {
        onTodoItemChange (username: $username, item: $item, type: $type) {
          item {
            ${_.join(['listId', 'todoId', 'description', 'dueDate', 'name', 'status'], '\n')}
          }
          type
          username
        }
      }`
    );

    this.userToListMutationGql = gql(
      `mutation onUserToListChange($username: String!, $item: UserToListChangeInput!, $type: String!) {
        onUserToListChange (username: $username, item: $item, type: $type) {
          item {
            ${_.join(['listId', 'userId', 'role'], '\n')}
          }
          type
          username
        }
      }`
    );
  }

  /**
   * Notifies the subscription when a todo item is changed.
   * @param {Object} keys - The keys for the todo item.
   * @param {string} typeInput - The type of change.
   * @param {Object} itemInput - The updated todo item.
   */
  async todoItemOnChanged(listId, typeInput, itemInput) {
      const userToLists = await this.userRepository.getUsersByList(listId);
      const userIds = userToLists.map(userToList => userToList.userId);
      const mutationPromises = userIds.map(userId =>
        this.graphqlClient.mutate({
          mutation: this.todoMutationGql,
          variables: { username: userId, type: typeInput, item: itemInput }
        })
      );
      return Promise.all(mutationPromises);
    }

  /**
   * Notifies the subscription when a user-to-list relationship is changed.
   * @param {Object} userId - The keys for the user-to-list relationship.
   * @param {string} typeInput - The type of change.
   * @param {Object} itemInput - The updated user-to-list relationship.
   */
  async userToListOnChanged(userId, typeInput, itemInput) {
    return this.graphqlClient.mutate({
      mutation: this.userToListMutationGql,
      variables: { username: userId, type: typeInput, item: itemInput }
    });
  }
}

module.exports = AppSyncService;