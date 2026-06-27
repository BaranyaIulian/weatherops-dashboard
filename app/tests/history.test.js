const request = require('supertest');
const app = require('../src/app');

describe('History endpoint', () => {
  beforeEach(async () => {
    await request(app).delete('/history');
  });

  test('GET /history should initially return empty history', async () => {
    const response = await request(app).get('/history');

    expect(response.statusCode).toBe(200);
    expect(response.body.count).toBe(0);
    expect(response.body.items).toEqual([]);
  });

  test('GET /history should return successful weather searches', async () => {
    await request(app).get('/weather?city=Bucharest');
    await request(app).get('/weather?city=London');

    const response = await request(app).get('/history');

    expect(response.statusCode).toBe(200);
    expect(response.body.count).toBe(2);
    expect(response.body.items[0].city).toBe('London');
    expect(response.body.items[0].status).toBe('success');
    expect(response.body.items[1].city).toBe('Bucharest');
    expect(response.body.items[1].status).toBe('success');
  });

  test('GET /history should include failed searches', async () => {
    await request(app).get('/weather');

    const response = await request(app).get('/history');

    expect(response.statusCode).toBe(200);
    expect(response.body.count).toBe(1);
    expect(response.body.items[0].status).toBe('failed');
    expect(response.body.items[0].city).toBe('unknown');
  });

  test('DELETE /history should clear search history', async () => {
    await request(app).get('/weather?city=Paris');

    const deleteResponse = await request(app).delete('/history');

    expect(deleteResponse.statusCode).toBe(200);
    expect(deleteResponse.body.message).toBe('History cleared successfully.');

    const historyResponse = await request(app).get('/history');

    expect(historyResponse.statusCode).toBe(200);
    expect(historyResponse.body.count).toBe(0);
    expect(historyResponse.body.items).toEqual([]);
  });
});