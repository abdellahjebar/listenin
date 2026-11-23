import { rateLimit } from 'express-rate-limit';
import type { RequestHandler } from 'express';
import { ApiError } from './errors.js';

/**
 * Limite le nombre de requêtes par adresse IP sur une fenêtre de temps (SEC-5, ADR 0006).
 * Au-delà : 429 au format commun, avec Retry-After. Compteurs en mémoire, propres à chaque
 * limiteur : valables tant qu'il n'y a qu'une instance de l'API.
 */
export function limitPerIp(options: { limit: number; windowMs: number }): RequestHandler {
  return rateLimit({
    ...options,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    handler: (_req, _res, next) => {
      next(new ApiError(429, 'TooManyRequests', 'Trop de tentatives, réessayez plus tard'));
    },
  });
}
