const express = require('express');
const cors = require('cors');
const path = require('path');

const config = require('./config/config');
const logger = require('./utils/logger');
const requestLogger = require('./middleware/request-logger');
const errorHandler = require('./middleware/error-handler');

const healthRoutes = require('./routes/health.routes');
const weatherRoutes = require('./routes/weather.routes');
const historyRoutes = require('./routes/history.routes');
const metricsRoutes = require('./routes/metrics.routes');

const app = express();

app.use(cors());
app.use(express.json());
app.use(requestLogger);
app.use(express.static(path.join(__dirname, 'public')));

app.use(healthRoutes);
app.use('/weather', weatherRoutes);
app.use('/history', historyRoutes);
app.use('/metrics', metricsRoutes);

app.get('/api', (req, res) => {
  res.status(200).json({
    message: 'WeatherOps Dashboard API',
    service: config.appName,
    version: config.appVersion,
    endpoints: [
      '/',
      '/api',
      '/health',
      '/ready',
      '/version',
      '/weather?city=Bucharest',
      '/history',
      '/metrics'
    ]
  });
});

app.use((req, res) => {
  logger.warn('route_not_found', {
    request_id: req.requestId,
    method: req.method,
    path: req.originalUrl,
    status_code: 404
  });

  res.status(404).json({
    error: 'Not Found',
    path: req.originalUrl,
    requestId: req.requestId,
    timestamp: new Date().toISOString()
  });
});

app.use(errorHandler);

module.exports = app;