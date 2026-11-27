import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createTestApp, TEST_ORIGIN } from '../helpers/app.js';
import { useTestDatabase } from '../helpers/database.js';

useTestDatabase();

const PASSWORD = 'une phrase de passe assez longue';

function signup(app: ReturnType<typeof createTestApp>, n: number, forwardedFor: string) {
  return request(app)
    .post('/api/accounts')
    .set('Origin', TEST_ORIGIN)
    .set('X-Forwarded-For', forwardedFor)
    .send({
      name: `Membre ${n}`,
      email: `membre${n}@example.com`,
      password: PASSWORD,
      acceptTerms: true,
    });
}

describe('TRUST_PROXY : limites de tentatives derrière nginx (SEC-5)', () => {
  it('derrière un proxy de confiance, deux visiteurs ont des compteurs séparés', async () => {
    const app = createTestApp(undefined, { trustProxy: 1 });
    for (let i = 0; i < 10; i++) {
      expect((await signup(app, i, '203.0.113.1')).status).toBe(201);
    }

    expect((await signup(app, 10, '203.0.113.1')).status).toBe(429);
    expect((await signup(app, 11, '198.51.100.2')).status).toBe(201);
  });

  it('sans proxy de confiance, un X-Forwarded-For falsifié ne contourne pas la limite', async () => {
    const app = createTestApp();
    for (let i = 0; i < 10; i++) {
      await signup(app, i, `203.0.113.${i}`);
    }

    expect((await signup(app, 10, '198.51.100.99')).status).toBe(429);
  });
});
