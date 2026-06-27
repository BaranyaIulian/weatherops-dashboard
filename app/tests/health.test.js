const request = require('supertest');
const app = require('../src/app');

describe('Health endpoints', () => {
  test('GET /health should return application health status', async () => {
    const response = await request(app).get('/health');

    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe('ok');
    expect(response.body.service).toBe('weatherops-dashboard');
    expect(response.body).toHaveProperty('uptime');
    expect(response.body).toHaveProperty('timestamp');
  });

  test('GET /ready should return readiness status', async () => {
    const response = await request(app).get('/ready');

    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe('ready');
    expect(response.body.service).toBe('weatherops-dashboard');
    expect(response.body).toHaveProperty('timestamp');
  });

  test('GET /version should return service version', async () => {
    const response = await request(app).get('/version');

    expect(response.statusCode).toBe(200);
    expect(response.body.service).toBe('weatherops-dashboard');
    expect(response.body.version).toBe('1.0.0-test');
    expect(response.body.environment).toBe('test');
  });
});