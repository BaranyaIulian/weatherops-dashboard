const { randomUUID } = require('crypto');
const logger = require('../utils/logger');
const { recordHttpRequest } = require('../utils/metrics');

function requestLogger(req, res, next) {
  const startTime = Date.now();
  const requestId = randomUUID();

  req.requestId = requestId;
  res.setHeader('X-Request-Id', requestId);

  res.on('finish', () => {
    const durationMs = Date.now() - startTime;
    const statusCode = res.statusCode;

    const logPayload = {
      request_id: requestId,
      method: req.method,
      path: req.originalUrl,
      status_code: statusCode,
      status: statusCode < 400 ? 'success' : 'failed',
      duration_ms: durationMs,
      ip: req.ip,
      user_agent: req.get('user-agent') || 'unknown'
    };

    if (statusCode >= 500) {
      logger.error('http_request', logPayload);
      return;
    }

    if (statusCode >= 400) {
      logger.warn('http_request', logPayload);
      return;
    }

    logger.info('http_request', logPayload);
  });

  next();
}

module.exports = requestLogger;