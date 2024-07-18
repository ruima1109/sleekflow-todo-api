const DBUtil = require('./repositories/database/dbUtil');

const _ = require('lodash');

const {UserToListTableName, TodoTableName, TodoKey, UserToListKey, DebugMode} = require('./config');

/**
 * Represents a data update handler implementation.
 */
class DataUpdateHandlerImpl {
  
  /**
   * Creates an instance of DataUpdateHandlerImpl.
   * @param {AppSyncService} appSyncService - The AppSync service.
   */
  constructor(appSyncService) {
    /** @type {import('./services/appSyncService')} */
    this.appSyncService = appSyncService;
  }

  EventSource = {
    TODO: 1,
    USER_TO_LIST: 2,
    UNKNOWN: 100
  };

  /**
   * Gets the event source based on the source string.
   * @param {string} source - The source string.
   * @returns {number} The event source.
   */
  _getEventSource(source) {
    if (source.includes(`table/${UserToListTableName}`)) {
      return this.EventSource.USER_TO_LIST;
    }
    if (source.includes(`table/${TodoTableName}`)) {
      return this.EventSource.TODO;
    }
    return this.EventSource.UNKNOWN;
  }

  /**
   * Unmarshalls the data from DynamoDB format.
   * @param {any} data - The data to unmarshall.
   * @returns {any} The unmarshalled data.
   */
  _unmarshallData(data) {
    return DBUtil.unmarshallDynamoDBItem(data);
  }

  /**
   * Handles the event.
   * @param {any} event - The event to handle.
   * @returns {Promise<void>} A promise that resolves when the event is handled.
   */
  async handleEvent(event) {
    const records = event.Records;
    console.log(`New ${records.length} records coming...`);
    if (DebugMode) {
      console.log(`Records: ${JSON.stringify(event)}`);
    }
    for (const record of records) {
      try {
        const keys = this._unmarshallData(record.dynamodb.Keys);
        const newItem = record.dynamodb.NewImage ? this._unmarshallData(record.dynamodb.NewImage) : null;
        const oldItem = record.dynamodb.OldImage ? this._unmarshallData(record.dynamodb.OldImage) : null;

        const eventSource = this._getEventSource(record.eventSourceARN);

        if (eventSource === this.EventSource.UNKNOWN) {
          console.log('Unrecognized event source');
          continue;
        }

        if (newItem && oldItem && _.isEqual(newItem, oldItem)) {
          console.log('No changes are made on subscribed fields');
          continue;
        }

        const item = newItem || oldItem;
        console.log(`Parsed items: ${JSON.stringify(item)}`);
        
        const type = record.eventName;
      
        if (eventSource === this.EventSource.TODO) {
          await this.appSyncService.todoItemOnChanged(keys[TodoKey], type, item);
          console.log('Successfully notified the subscription');
        } else if (eventSource === this.EventSource.USER_TO_LIST) {
          await this.appSyncService.userToListOnChanged(keys[UserToListKey], type, item);
          console.log('Successfully notified the subscription');
        }

      } catch (error) {
        console.log(`Failed to parse or update the event. Error: ${error}, Event: ${JSON.stringify(record)}`);
      }
    }
  }
}

module.exports = DataUpdateHandlerImpl;