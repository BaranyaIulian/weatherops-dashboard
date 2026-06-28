require('dotenv').config();

const app = require('./app');
const config = require('./config/config');
const logger = require('./utils/logger');

app.listen(config.port, () => {
  logger.info('application_started', {
    version: config.appVersion,
    port: config.port,
    mockMode: config.mockMode
  });
});