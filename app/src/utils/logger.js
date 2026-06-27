const config = require('../config/config');

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3
};

function shouldLog(level) {
  const configuredLevel = config.logLevel || 'info';
  return levels[level] <= levels[configuredLevel];
}

function normalizeError(error) {
  if (!error) {
    return undefined;
  }

  if (error instanceof Error) {
    return {
      message: error.message,
      stack: config.nodeEnv === 'development' ? error.stack : undefined
    };
  }

  return error;
}

function log(level, event, fields = {}) {
  if (!shouldLog(level)) {
    return;
  }

  const payload = {
    level,
    event,
    service: config.appName,
    environment: config.nodeEnv,
    timestamp: new Date().toISOString(),
    ...fields
  };

  if (payload.error) {
    payload.error = normalizeError(payload.error);
  }

  const serializedPayload = JSON.stringify(payload);

  if (level === 'error') {
    console.error(serializedPayload);
    return;
  }

  console.log(serializedPayload);
}

module.exports = {
  error: (event, fields) => log('error', event, fields),
  warn: (event, fields) => log('warn', event, fields),
  info: (event, fields) => log('info', event, fields),
  debug: (event, fields) => log('debug', event, fields)
};