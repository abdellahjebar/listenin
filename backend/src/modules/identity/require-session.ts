import type { RequestHandler, Response } from 'express';
import { ApiError } from '../../middleware/errors.js';
import { findActiveSession, sessionTokenFrom, type ActiveSession } from './sessions.js';

const UNAUTHENTICATED = () => new ApiError(401, 'Unauthenticated', 'Connexion requise');

/**
 * Protège une route réservée aux membres : sans session valide, 401 (AUTHORIZATION.md).
 * La route retrouve ensuite le membre avec `currentMember(res)`.
 */
export const requireSession: RequestHandler = async (req, res, next) => {
  const token = sessionTokenFrom(req.cookies);
  const session = token ? await findActiveSession(token) : null;
  if (!session) {
    next(UNAUTHENTICATED());
    return;
  }
  res.locals.member = session;
  next();
};

/** Le membre connecté ; à n'appeler que derrière `requireSession`. */
export function currentMember(res: Response): ActiveSession {
  const member = res.locals.member as ActiveSession | undefined;
  if (!member) {
    throw new Error('currentMember appelé sans requireSession');
  }
  return member;
}
