import { fileURLToPath } from 'node:url';
import express, { type Express } from 'express';
import * as OpenApiValidator from 'express-openapi-validator';
import helmet from 'helmet';
import type { Logger } from 'pino';
import { pinoHttp } from 'pino-http';
import { errorHandler, notFound } from './middleware/errors.js';
import { healthRouter } from './routes/health.js';

/** Le contrat est à la racine de backend/ : un niveau au-dessus de src/ comme de dist/. */
export const OPENAPI_SPEC_PATH = fileURLToPath(new URL('../openapi.yaml', import.meta.url));

export interface AppOptions {
  /** Les tests valident aussi chaque réponse : une réponse hors contrat les fait échouer (ADR 0007). */
  validateResponses?: boolean;
}

/** Construit l'application sans ouvrir de port : le serveur réel et les tests l'utilisent tous deux. */
export function createApp(logger: Logger, options: AppOptions = {}): Express {
  const app = express();

  app.use(helmet());
  app.use(pinoHttp({ logger }));
  app.use(express.json({ limit: '100kb' }));

  // Toute requête est comparée au contrat avant d'atteindre une route : hors contrat, 400 (SEC-3).
  app.use(
    OpenApiValidator.middleware({
      apiSpec: OPENAPI_SPEC_PATH,
      validateRequests: true,
      validateResponses: options.validateResponses ?? false,
    }),
  );

  app.use('/api/health', healthRouter);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
