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

const COOKIE_OPTIONS: CookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: 'strict',
  path: '/',
  maxAge: ABSOLUTE_TIMEOUT_MS,
};

export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
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
    expiresAt: new Date(now.getTime() + Math.min(IDLE_TIMEOUT_MS, ABSOLUTE_TIMEOUT_MS)),
  });
  return token;
}

export function setSessionCookie(res: Response, token: string): void {
  res.cookie(SESSION_COOKIE, token, COOKIE_OPTIONS);
}
