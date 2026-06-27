const request = require('supertest');
const app = require('../src/app');

describe('API info endpoint', () => {
  test('GET /api should return API metadata and endpoints', async () => {
    const response = await request(app).get('/api');

    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe('WeatherOps Dashboard API');
    expect(response.body.service).toBe('weatherops-dashboard');
    expect(response.body.endpoints).toContain('/health');
    expect(response.body.endpoints).toContain('/ready');
    expect(response.body.endpoints).toContain('/weather?city=Bucharest');
    expect(response.body.endpoints).toContain('/history');
    expect(response.body.endpoints).toContain('/metrics');
  });
});