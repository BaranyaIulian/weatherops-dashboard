const express = require('express');
const logger = require('../utils/logger');
const { getWeatherByCity } = require('../services/weather.service');
const {
  addHistoryItem,
  addFailedHistoryItem
} = require('../services/history.service');
const {
  recordWeatherRequest,
  recordWeatherProviderError
} = require('../utils/metrics');

const router = express.Router();

router.get('/', async (req, res) => {
  const startTime = Date.now();
  const city = req.query.city;

  try {
    const weather = await getWeatherByCity(city);
    const durationMs = Date.now() - startTime;

    addHistoryItem(weather, 'success');

    logger.info('weather_search', {
      request_id: req.requestId,
      city: weather.city,
      status: 'success',
      source: weather.source,
      duration_ms: durationMs
    });

    res.status(200).json(weather);
  } catch (error) {
    const durationMs = Date.now() - startTime;
    const statusCode = error.statusCode || 500;

    addFailedHistoryItem(city, error.message);

    logger.error('weather_search_failed', {
      request_id: req.requestId,
      city: city || null,
      status: 'failed',
      status_code: statusCode,
      error: error.message,
      duration_ms: durationMs
    });

    res.status(statusCode).json({
      error: error.message,
      statusCode,
      requestId: req.requestId,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;