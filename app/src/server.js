const express = require('express');
const cors = require('cors');
require('dotenv').config();

const config = require('./config/config');
const healthRoutes = require('./routes/health.routes');

const app = express();

app.use(cors());
app.use(express.json());

app.use(healthRoutes);

app.get('/', (req, res) => {
  res.status(200).json({
    message: 'WeatherOps Dashboard API',
    service: config.appName,
    version: config.appVersion,
    endpoints: [
      '/',
      '/health',
      '/ready',
      '/version'
    ]
  });
});

app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    path: req.originalUrl,
    timestamp: new Date().toISOString()
  });
});

app.listen(config.port, () => {
  console.log(JSON.stringify({
    level: 'info',
    event: 'application_started',
    service: config.appName,
    version: config.appVersion,
    port: config.port,
    environment: config.nodeEnv,
    timestamp: new Date().toISOString()
  }));
});

module.exports = app;