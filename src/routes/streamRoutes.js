const { createAppSyncService } = require('../factories/serviceFactory');

const { Router } = require('@awaitjs/express');
const router = Router({ mergeParams: true });

const DataUpdateHandlerImpl = require('../dataUpdateHandlerImpl');

/** @type {import('../services/appSyncService')} */
const appSyncService = createAppSyncService();

/** @type {DataUpdateHandlerImpl} */
const dataHanlder = new DataUpdateHandlerImpl(appSyncService);

router.postAsync('/',  async (req, res) => {
  await dataHanlder.handleEvent(req.body);
  res.status(200).send('OK');
});

module.exports = router;