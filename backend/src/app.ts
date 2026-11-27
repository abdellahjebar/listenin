import { fileURLToPath } from 'node:url';
import cookieParser from 'cookie-parser';
import express, { type Express } from 'express';
import * as OpenApiValidator from 'express-openapi-validator';
import helmet from 'helmet';
import type { Logger } from 'pino';
import { pinoHttp } from 'pino-http';
import { errorHandler, notFound } from './middleware/errors.js';
import { requireSameOrigin } from './middleware/origin.js';
import { createAccountsRouter, createSessionsRouter } from './modules/identity/index.js';
import { healthRouter } from './routes/health.js';

/** Le contrat est à la racine de backend/ : un niveau au-dessus de src/ comme de dist/. */
export const OPENAPI_SPEC_PATH = fileURLToPath(new URL('../openapi.yaml', import.meta.url));

export interface AppOptions {
  /** Origine de l'application web, seule admise sur les requêtes qui modifient des données. */
  appOrigin: string;
  /** Les tests valident aussi chaque réponse : une réponse hors contrat les fait échouer (ADR 0007). */
  validateResponses?: boolean;
  /** Nombre de proxys de confiance (voir TRUST_PROXY dans config.ts). */
  trustProxy?: number;
}

/** Construit l'application sans ouvrir de port : le serveur réel et les tests l'utilisent tous deux. */
export function createApp(logger: Logger, options: AppOptions): Express {
  const app = express();
  // Derrière nginx, req.ip devient l'adresse du visiteur, lue dans X-Forwarded-For.
  app.set('trust proxy', options.trustProxy ?? 0);

  app.use(helmet());
  app.use(pinoHttp({ logger }));
  app.use(requireSameOrigin(options.appOrigin));
  app.use(express.json({ limit: '100kb' }));
  app.use(cookieParser());

  // Toute requête est comparée au contrat avant d'atteindre une route : hors contrat, 400 (SEC-3).
  app.use(
    OpenApiValidator.middleware({
      apiSpec: OPENAPI_SPEC_PATH,
      validateRequests: true,
      validateResponses: options.validateResponses ?? false,
      // L'authentification est vérifiée par requireSession, qui répond au format commun.
      validateSecurity: false,
    }),
  );

  app.use('/api/health', healthRouter);
  app.use('/api/accounts', createAccountsRouter());
  app.use('/api/sessions', createSessionsRouter());

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
