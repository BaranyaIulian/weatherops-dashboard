process.env.APP_NAME = 'weatherops-dashboard';
process.env.APP_VERSION = '1.1.0-test';
process.env.PORT = '3000';
process.env.NODE_ENV = 'test';
process.env.LOG_LEVEL = 'silent';

process.env.MOCK_MODE = 'true';

process.env.OPEN_METEO_GEOCODING_URL =
  'https://geocoding-api.open-meteo.com/v1/search';

process.env.OPEN_METEO_FORECAST_URL =
  'https://api.open-meteo.com/v1/forecast';

process.env.OPEN_METEO_LANGUAGE = 'ro';
process.env.WEATHER_REQUEST_TIMEOUT_MS = '5000';
process.env.CACHE_TTL_SECONDS = '300';