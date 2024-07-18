const { QueryCommand } = require('@aws-sdk/lib-dynamodb');
const UserRepository = require('../../repositories/userRepository');
const DatabaseManager = require('../../repositories/database/databaseManager');

jest.mock('@aws-sdk/lib-dynamodb', () => {
  return {
    QueryCommand: jest.fn()
  };
});

jest.mock('../../repositories/database/databaseManager');

describe('UserRepository', () => {
  let userRepository;
  let mockClient;

  beforeEach(() => {
    mockClient = {
      send: jest.fn()
    };
    DatabaseManager.mockImplementation(() => {
      return {
        getClient: () => mockClient
      };
    });
    const databaseManager = new DatabaseManager();
    userRepository = new UserRepository(databaseManager);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should get users by list ID', async () => {
    const listId = 'test-list-id';
    const expectedResponse = {
      Items: [{ userId: 'user1' }, { userId: 'user2' }]
    };

    mockClient.send.mockResolvedValue(expectedResponse);

    const result = await userRepository.getUsersByList(listId);

    expect(QueryCommand).toHaveBeenCalledWith({
      TableName: 'sleekflow-user-to-list', 
      IndexName: 'listId-index',
      KeyConditionExpression: '#lid = :lid',
      ExpressionAttributeNames: {
        '#lid': 'listId'
      },
      ExpressionAttributeValues: {
        ':lid': listId
      }
    });
    

    expect(false).toEqual(expectedResponse.Items);
  });
});