const request = require('supertest');
const app = require('../src/app');

describe('Not found handler', () => {
  test('GET invalid route should return 404', async () => {
    const response = await request(app).get('/invalid-route');

    expect(response.statusCode).toBe(404);
    expect(response.body.error).toBe('Not Found');
    expect(response.body.path).toBe('/invalid-route');
    expect(response.body).toHaveProperty('requestId');
    expect(response.body).toHaveProperty('timestamp');
  });
});