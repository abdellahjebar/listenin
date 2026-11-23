import { createHash, randomBytes } from 'node:crypto';
import type { CookieOptions, Response } from 'express';
import type { mongoose } from '../../database.js';
import { SessionModel } from './session.model.js';

/**
 * Le préfixe __Host- oblige le navigateur à exiger Secure, Path=/ et aucun domaine :
 * le cookie ne peut être ni posé ni lu par un sous-domaine.
 */
export const SESSION_COOKIE = '__Host-session';

const DAY_MS = 24 * 60 * 60 * 1000;
export const IDLE_TIMEOUT_MS = 7 * DAY_MS;
export const ABSOLUTE_TIMEOUT_MS = 30 * DAY_MS;

/** Une session active n'est prolongée qu'une fois par intervalle, pas à chaque requête. */
export const TOUCH_INTERVAL_MS = 5 * 60 * 1000;

const BASE_COOKIE_OPTIONS: CookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: 'strict',
  path: '/',
};

export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

/** La plus proche des deux limites : 7 jours après la dernière activité, 30 jours après l'ouverture. */
function expiryFor(createdAt: Date, lastSeenAt: Date): Date {
  return new Date(
    Math.min(lastSeenAt.getTime() + IDLE_TIMEOUT_MS, createdAt.getTime() + ABSOLUTE_TIMEOUT_MS),
  );
}

/** Ouvre une session et renvoie son numéro, à remettre au navigateur et nulle part ailleurs. */
export async function createSession(accountId: mongoose.Types.ObjectId): Promise<string> {
  const token = randomBytes(32).toString('base64url');
  const now = new Date();
  await SessionModel.create({
    tokenHash: hashToken(token),
    accountId,
    createdAt: now,
    lastSeenAt: now,
    expiresAt: expiryFor(now, now),
  });
  return token;
}

export interface ActiveSession {
  sessionId: mongoose.Types.ObjectId;
  accountId: mongoose.Types.ObjectId;
}

/**
 * Retrouve la session d'un numéro, si elle est encore valide, et la prolonge.
 * Les deux délais sont vérifiés ici : MongoDB ne supprime les sessions expirées qu'environ
 * une fois par minute.
 */
export async function findActiveSession(
  token: string,
  now: Date = new Date(),
): Promise<ActiveSession | null> {
  const session = await SessionModel.findOne({ tokenHash: hashToken(token) });
  if (
    !session ||
    session.expiresAt <= now ||
    expiryFor(session.createdAt, session.lastSeenAt) <= now
  ) {
    return null;
  }

  if (now.getTime() - session.lastSeenAt.getTime() >= TOUCH_INTERVAL_MS) {
    await SessionModel.updateOne(
      { _id: session._id },
      { lastSeenAt: now, expiresAt: expiryFor(session.createdAt, now) },
    );
  }
  return { sessionId: session._id, accountId: session.accountId };
}

export async function deleteSession(token: string): Promise<void> {
  await SessionModel.deleteOne({ tokenHash: hashToken(token) });
}

export function setSessionCookie(res: Response, token: string): void {
  res.cookie(SESSION_COOKIE, token, { ...BASE_COOKIE_OPTIONS, maxAge: ABSOLUTE_TIMEOUT_MS });
}

export function clearSessionCookie(res: Response): void {
  res.clearCookie(SESSION_COOKIE, BASE_COOKIE_OPTIONS);
}

/** Le numéro de session envoyé par le navigateur, s'il y en a un (lu par cookie-parser). */
export function sessionTokenFrom(cookies: unknown): string | undefined {
  if (typeof cookies !== 'object' || cookies === null) {
    return undefined;
  }
  const token = (cookies as Record<string, unknown>)[SESSION_COOKIE];
  return typeof token === 'string' && token.length > 0 ? token : undefined;
}
