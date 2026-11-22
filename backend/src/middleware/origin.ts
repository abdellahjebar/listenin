import type { RequestHandler } from 'express';
import { ApiError } from './errors.js';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

/**
 * Refuse toute requête qui modifie des données si son en-tête Origin n'est pas celui de ListenIn
 * (SEC-10, ADR 0006). En complément de SameSite=Strict, contre les requêtes forgées (CSRF).
 * Les navigateurs envoient toujours Origin sur ces requêtes : son absence est un refus.
 */
export function requireSameOrigin(appOrigin: string): RequestHandler {
  return (req, _res, next) => {
    if (SAFE_METHODS.has(req.method) || req.get('origin') === appOrigin) {
      next();
      return;
    }
    next(new ApiError(403, 'ForbiddenOrigin', 'Requête refusée : origine non autorisée'));
  };
}
