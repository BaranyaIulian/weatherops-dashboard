process.env.APP_NAME = 'weatherops-dashboard';
process.env.APP_VERSION = '1.0.0-test';
process.env.PORT = '3000';
process.env.NODE_ENV = 'test';
process.env.LOG_LEVEL = 'error';

process.env.MOCK_MODE = 'true';
process.env.WEATHER_API_URL = 'https://api.openweathermap.org/data/2.5/weather';
process.env.WEATHER_API_KEY = 'replace-me';
process.env.WEATHER_UNITS = 'metric';
process.env.CACHE_TTL_SECONDS = '300';

const request = require('supertest');
const app = require('../src/app');

describe('Metrics endpoint', () => {
  test('GET /metrics should expose Prometheus metrics', async () => {
    const response = await request(app).get('/metrics');

    expect(response.statusCode).toBe(200);
    expect(response.headers['content-type']).toContain('text/plain');
    expect(response.text).toContain('weatherops_http_requests_total');
    expect(response.text).toContain('weatherops_weather_requests_total');
    expect(response.text).toContain('weatherops_history_items');
  });

  test('GET /metrics should include weather metrics after weather request', async () => {
    const weatherResponse = await request(app).get('/weather?city=Bucharest');

    expect(weatherResponse.statusCode).toBe(200);
    expect(weatherResponse.body.source).toBe('mock');

    const response = await request(app).get('/metrics');

    expect(response.statusCode).toBe(200);
    expect(response.text).toContain('weatherops_weather_requests_total');
    expect(response.text).toContain('status="success"');
    expect(response.text).toContain('source="mock"');
  });
});