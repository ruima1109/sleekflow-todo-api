const { createAppSyncService } = require('./factories/serviceFactory');
const DataUpdateHandlerImpl = require('./dataUpdateHandlerImpl');

/** @type {import('./services/appSyncService')} */
const appSyncService = createAppSyncService();

/** @type {DataUpdateHandlerImpl} */
const dataHanlder = new DataUpdateHandlerImpl(appSyncService);

const handler = async (event) => {
  await dataHanlder.handleEvent(event);
};

module.exports = { handler };