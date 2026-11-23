import type { Express } from 'express';
import request from 'supertest';
import { TEST_ORIGIN } from './app.js';

/** Le couple « __Host-session=… » posé par une réponse, prêt à renvoyer dans l'en-tête Cookie. */
export function sessionCookieOf(response: request.Response): string | undefined {
  const cookies = response.headers['set-cookie'] as unknown as string[] | undefined;
  return cookies?.find((cookie) => cookie.startsWith('__Host-session='))?.split(';')[0];
}

/** Le numéro de session seul. */
export function sessionTokenOf(response: request.Response): string | undefined {
  return sessionCookieOf(response)?.split('=')[1];
}

export const MEMBER = {
  name: 'Ada Lovelace',
  email: 'ada@example.com',
  password: 'une phrase de passe assez longue',
};

/** Inscrit un membre par l'API et renvoie son cookie de session. */
export async function signUp(app: Express, member = MEMBER): Promise<string> {
  const response = await request(app)
    .post('/api/accounts')
    .set('Origin', TEST_ORIGIN)
    .send({ ...member, acceptTerms: true });
  if (response.status !== 201) {
    throw new Error(`Inscription impossible : ${response.status}`);
  }
  return sessionCookieOf(response)!;
}
