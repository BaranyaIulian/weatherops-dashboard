const logger = require('../utils/logger');

function errorHandler(error, req, res, next) {
  const statusCode = error.statusCode || 500;

  logger.error('unhandled_error', {
    request_id: req.requestId,
    method: req.method,
    path: req.originalUrl,
    status_code: statusCode,
    error
  });

  res.status(statusCode).json({
    error: error.message || 'Internal Server Error',
    statusCode,
    requestId: req.requestId,
    timestamp: new Date().toISOString()
  });
}

module.exports = errorHandler;