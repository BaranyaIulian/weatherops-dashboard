const request = require('supertest');
const app = require('../src/app');

describe('Weather endpoint', () => {
  test('GET /weather?city=Bucharest should return mock weather data', async () => {
    const response = await request(app).get('/weather?city=Bucharest');

    expect(response.statusCode).toBe(200);
    expect(response.body.city).toBe('Bucharest');
    expect(response.body.country).toBe('MOCK');
    expect(response.body.temperature).toBe(24);
    expect(response.body.humidity).toBe(45);
    expect(response.body.pressure).toBe(1013);
    expect(response.body.windSpeed).toBe(3.4);
    expect(response.body.description).toBe('mock clear sky');
    expect(response.body.source).toBe('mock');
    expect(response.body).toHaveProperty('timestamp');
  });

  test('GET /weather without city should return 400', async () => {
    const response = await request(app).get('/weather');

    expect(response.statusCode).toBe(400);
    expect(response.body.error).toBe('City query parameter is required.');
    expect(response.body.statusCode).toBe(400);
    expect(response.body).toHaveProperty('requestId');
  });

  test('GET /weather with one character city should return 400', async () => {
    const response = await request(app).get('/weather?city=A');

    expect(response.statusCode).toBe(400);
    expect(response.body.error).toBe('City name must contain at least 2 characters.');
    expect(response.body.statusCode).toBe(400);
  });
});