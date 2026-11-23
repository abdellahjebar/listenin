import { ipKeyGenerator, rateLimit } from 'express-rate-limit';
import type { Request, RequestHandler } from 'express';
import { ApiError } from './errors.js';

export interface LimitOptions {
  limit: number;
  windowMs: number;
  /** Compter par adresse IP et par une autre valeur de la requête (l'adresse e-mail, par exemple). */
  keyWith?: (req: Request) => string;
  /** Ne compter que les échecs : une réponse réussie ne consomme pas la limite. */
  failuresOnly?: boolean;
}

/**
 * Limite le nombre de requêtes sur une fenêtre de temps (SEC-5, ADR 0006).
 * Au-delà : 429 au format commun, avec Retry-After. Compteurs en mémoire, propres à chaque
 * limiteur : valables tant qu'il n'y a qu'une instance de l'API.
 */
export function limitRequests(options: LimitOptions): RequestHandler {
  const { keyWith, failuresOnly, ...window } = options;
  return rateLimit({
    ...window,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    skipSuccessfulRequests: failuresOnly ?? false,
    // ipKeyGenerator regroupe les adresses IPv6 d'un même bloc, qu'un attaquant changerait à volonté.
    keyGenerator: (req) => {
      const ip = ipKeyGenerator(req.ip ?? '');
      return keyWith ? `${ip}|${keyWith(req)}` : ip;
    },
    handler: (_req, _res, next) => {
      next(new ApiError(429, 'TooManyRequests', 'Trop de tentatives, réessayez plus tard'));
    },
  });
}
