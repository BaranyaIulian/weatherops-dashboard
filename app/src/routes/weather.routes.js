const express = require('express');
const { getWeatherByCity } = require('../services/weather.service');
const {
  addHistoryItem,
  addFailedHistoryItem
} = require('../services/history.service');

const router = express.Router();

router.get('/', async (req, res) => {
  const startTime = Date.now();
  const city = req.query.city;

  try {
    const weather = await getWeatherByCity(city);
    const durationMs = Date.now() - startTime;

    addHistoryItem(weather, 'success');

    console.log(JSON.stringify({
      level: 'info',
      event: 'weather_search',
      service: 'weatherops-dashboard',
      city: weather.city,
      status: 'success',
      source: weather.source,
      duration_ms: durationMs,
      timestamp: new Date().toISOString()
    }));

    res.status(200).json(weather);
  } catch (error) {
    const durationMs = Date.now() - startTime;
    const statusCode = error.statusCode || 500;

    addFailedHistoryItem(city, error.message);

    console.log(JSON.stringify({
      level: 'error',
      event: 'weather_search_failed',
      service: 'weatherops-dashboard',
      city: city || null,
      status: 'failed',
      status_code: statusCode,
      error: error.message,
      duration_ms: durationMs,
      timestamp: new Date().toISOString()
    }));

    res.status(statusCode).json({
      error: error.message,
      statusCode,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;
