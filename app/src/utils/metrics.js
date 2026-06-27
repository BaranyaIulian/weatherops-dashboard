const client = require('prom-client');
const config = require('../config/config');

const register = new client.Registry();

register.setDefaultLabels({
  app: config.appName,
  service: config.appName,
  environment: config.nodeEnv
});

client.collectDefaultMetrics({
  register,
  prefix: 'weatherops_'
});

const httpRequestsTotal = new client.Counter({
  name: 'weatherops_http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code', 'status'],
  registers: [register]
});

const httpRequestDurationSeconds = new client.Histogram({
  name: 'weatherops_http_request_duration_seconds',
  help: 'HTTP request duration in seconds',
  labelNames: ['method', 'route', 'status_code', 'status'],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2, 5],
  registers: [register]
});

const weatherRequestsTotal = new client.Counter({
  name: 'weatherops_weather_requests_total',
  help: 'Total number of weather search requests',
  labelNames: ['status', 'source'],
  registers: [register]
});

const weatherRequestDurationSeconds = new client.Histogram({
  name: 'weatherops_weather_request_duration_seconds',
  help: 'Weather search request duration in seconds',
  labelNames: ['status', 'source'],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2, 5],
  registers: [register]
});

const weatherMockResponsesTotal = new client.Counter({
  name: 'weatherops_weather_mock_responses_total',
  help: 'Total number of weather responses served from mock mode',
  registers: [register]
});

const weatherProviderErrorsTotal = new client.Counter({
  name: 'weatherops_weather_provider_errors_total',
  help: 'Total number of weather provider errors',
  labelNames: ['status_code'],
  registers: [register]
});

const historyItemsGauge = new client.Gauge({
  name: 'weatherops_history_items',
  help: 'Current number of weather search history items stored in memory',
  registers: [register]
});

function normalizeRoute(originalUrl) {
  const path = originalUrl.split('?')[0];

  if (path === '/') {
    return '/';
  }

  if (path.startsWith('/weather')) {
    return '/weather';
  }

  if (path.startsWith('/history')) {
    return '/history';
  }

  if (path.startsWith('/health')) {
    return '/health';
  }

  if (path.startsWith('/ready')) {
    return '/ready';
  }

  if (path.startsWith('/version')) {
    return '/version';
  }

  if (path.startsWith('/api')) {
    return '/api';
  }

  if (path.startsWith('/metrics')) {
    return '/metrics';
  }

  if (
    path.endsWith('.css') ||
    path.endsWith('.js') ||
    path.endsWith('.ico') ||
    path.endsWith('.png') ||
    path.endsWith('.jpg') ||
    path.endsWith('.svg')
  ) {
    return '/static';
  }

  return 'unknown';
}

function recordHttpRequest({ method, originalUrl, statusCode, durationMs }) {
  const route = normalizeRoute(originalUrl);
  const status = statusCode < 400 ? 'success' : 'failed';

  if (route === '/metrics') {
    return;
  }

  const labels = {
    method,
    route,
    status_code: String(statusCode),
    status
  };

  httpRequestsTotal.inc(labels);
  httpRequestDurationSeconds.observe(labels, durationMs / 1000);
}

function recordWeatherRequest({ status, source, durationMs }) {
  const safeSource = source || 'unknown';

  const labels = {
    status,
    source: safeSource
  };

  weatherRequestsTotal.inc(labels);
  weatherRequestDurationSeconds.observe(labels, durationMs / 1000);

  if (safeSource === 'mock') {
    weatherMockResponsesTotal.inc();
  }
}

function recordWeatherProviderError(statusCode) {
  weatherProviderErrorsTotal.inc({
    status_code: String(statusCode || 500)
  });
}

function setHistoryItems(count) {
  historyItemsGauge.set(count);
}

module.exports = {
  register,
  recordHttpRequest,
  recordWeatherRequest,
  recordWeatherProviderError,
  setHistoryItems
};