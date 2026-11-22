import express from 'express';
import * as OpenApiValidator from 'express-openapi-validator';
import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp, OPENAPI_SPEC_PATH } from '../src/app.js';
import { createLogger } from '../src/logger.js';
import { errorHandler } from '../src/middleware/errors.js';

const logger = createLogger({ NODE_ENV: 'test', LOG_LEVEL: 'info' });
const app = createApp(logger, { validateResponses: true });

describe('requêtes hors contrat', () => {
  it('route inconnue : 404 au format commun', async () => {
    const response = await request(app).get('/api/inconnue');

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      error: { code: 'NotFound', message: 'Ressource inconnue' },
    });
  });

  it('chemin hors de /api : 404 au format commun', async () => {
    const response = await request(app).get('/ailleurs');

    expect(response.status).toBe(404);
    expect(response.body).toMatchObject({ error: { code: 'NotFound' } });
  });

  it('méthode non décrite : 405 avec l’en-tête Allow', async () => {
    const response = await request(app).delete('/api/health');

    expect(response.status).toBe(405);
    expect(response.headers['allow']).toMatch(/GET/);
    expect(response.body).toMatchObject({ error: { code: 'MethodNotAllowed' } });
  });

  it('JSON illisible : 400 InvalidJson', async () => {
    const response = await request(app)
      .post('/api/health')
      .set('Content-Type', 'application/json')
      .send('{ pas du json');

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: { code: 'InvalidJson', message: 'Corps de requête JSON illisible' },
    });
  });
});

describe('gestionnaire d’erreurs', () => {
  function appThatFailsWith(error: unknown) {
    const failing = express();
    failing.use((req, _res, next) => {
      req.log = logger;
      next(error);
    });
    failing.use(errorHandler);
    return failing;
  }

  it('erreur de validation : 400 avec un détail par champ', async () => {
    const response = await request(
      appThatFailsWith({
        status: 400,
        errors: [
          { path: '/body/email', message: 'must match format "email"' },
          { path: '/body/address/city', message: 'must be string' },
        ],
      }),
    ).get('/');

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: {
        code: 'ValidationError',
        message: 'La requête ne respecte pas le contrat',
        details: [
          { target: 'email', message: 'must match format "email"' },
          { target: 'address.city', message: 'must be string' },
        ],
      },
    });
  });

  it('erreur inattendue : 500 sans détail interne', async () => {
    const response = await request(appThatFailsWith(new Error('secret interne'))).get('/');

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      error: { code: 'InternalError', message: 'Erreur interne du serveur' },
    });
    expect(JSON.stringify(response.body)).not.toContain('secret');
  });
});

describe('réponses hors contrat', () => {
  it('une réponse qui s’écarte du contrat fait échouer la requête en test', async () => {
    const drifting = express();
    drifting.use((req, _res, next) => {
      req.log = logger;
      next();
    });
    drifting.use(
      OpenApiValidator.middleware({
        apiSpec: OPENAPI_SPEC_PATH,
        validateRequests: true,
        validateResponses: true,
      }),
    );
    drifting.get('/api/health', (_req, res) => {
      res.json({ status: 'ko' });
    });
    drifting.use(errorHandler);

    const response = await request(drifting).get('/api/health');

    expect(response.status).toBe(500);
  });
});
