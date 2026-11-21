import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from '../src/app.js';
import { createLogger } from '../src/logger.js';

const app = createApp(createLogger({ NODE_ENV: 'test', LOG_LEVEL: 'info' }), {
  validateResponses: true,
});

describe('GET /api/health', () => {
  it('répond 200 avec { status: "ok" }', async () => {
    const response = await request(app).get('/api/health');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'ok' });
  });

  it('pose les en-têtes de sécurité de helmet et masque Express', async () => {
    const response = await request(app).get('/api/health');

    expect(response.headers['x-content-type-options']).toBe('nosniff');
    expect(response.headers['x-powered-by']).toBeUndefined();
  });
});
