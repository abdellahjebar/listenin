import { Writable } from 'node:stream';
import type { Express } from 'express';
import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';
import { hashToken } from '../../src/modules/identity/sessions.js';
import { SessionModel } from '../../src/modules/identity/session.model.js';
import { createTestApp, TEST_ORIGIN } from '../helpers/app.js';
import { useTestDatabase } from '../helpers/database.js';
import { MEMBER, sessionCookieOf, sessionTokenOf, signUp } from '../helpers/session.js';

useTestDatabase();

const MINUTE = 60 * 1000;
const DAY = 24 * 60 * MINUTE;

let app: Express;

beforeEach(() => {
  app = createTestApp();
});

function logIn(body: object, cookie?: string, target = app) {
  const req = request(target).post('/api/sessions').set('Origin', TEST_ORIGIN);
  if (cookie) req.set('Cookie', cookie);
  return req.send(body);
}

function current(cookie?: string) {
  const req = request(app).get('/api/sessions/current');
  if (cookie) req.set('Cookie', cookie);
  return req;
}

function logOut(cookie?: string) {
  const req = request(app).delete('/api/sessions/current').set('Origin', TEST_ORIGIN);
  if (cookie) req.set('Cookie', cookie);
  return req;
}

/** Déplace dans le temps la session d'un cookie, comme si ces dates étaient passées. */
async function setSessionDates(
  cookie: string,
  dates: { createdAt: Date; lastSeenAt: Date; expiresAt: Date },
) {
  await SessionModel.updateOne({ tokenHash: hashToken(cookie.split('=')[1]!) }, dates);
}

describe('A2 : se connecter (story 2)', () => {
  it('bons identifiants : 201, le membre et un cookie de session', async () => {
    await signUp(app);

    const response = await logIn({ email: MEMBER.email, password: MEMBER.password });

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({ name: MEMBER.name, email: MEMBER.email });
    expect(sessionCookieOf(response)).toBeDefined();
  });

  it('l’adresse est reconnue quelle que soit la casse', async () => {
    await signUp(app);

    const response = await logIn({ email: 'ADA@Example.com', password: MEMBER.password });

    expect(response.status).toBe(201);
  });

  it('F4 : adresse inconnue et mauvais mot de passe reçoivent exactement la même réponse', async () => {
    await signUp(app);

    const unknown = await logIn({ email: 'personne@example.com', password: MEMBER.password });
    const wrong = await logIn({ email: MEMBER.email, password: 'un autre mot de passe long' });

    expect(unknown.status).toBe(401);
    expect(wrong.status).toBe(401);
    expect(unknown.body).toEqual(wrong.body);
    expect(unknown.body).toEqual({
      error: { code: 'InvalidCredentials', message: 'Adresse e-mail ou mot de passe incorrect' },
    });
  });

  it('fixation : la connexion remplace la session du navigateur par une nouvelle', async () => {
    const oldCookie = await signUp(app);

    const response = await logIn({ email: MEMBER.email, password: MEMBER.password }, oldCookie);

    expect(sessionCookieOf(response)).not.toBe(oldCookie);
    expect((await current(oldCookie)).status).toBe(401);
    expect((await current(sessionCookieOf(response))).status).toBe(200);
  });

  it('SEC-10 : connexion sans l’origine de ListenIn : 403', async () => {
    const response = await request(app)
      .post('/api/sessions')
      .send({ email: MEMBER.email, password: MEMBER.password });

    expect(response.status).toBe(403);
  });
});

describe('session en cours', () => {
  it('membre connecté : 200 avec son identité', async () => {
    const cookie = await signUp(app);

    const response = await current(cookie);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ name: MEMBER.name, email: MEMBER.email });
  });

  it('sans cookie : 401', async () => {
    const response = await current();

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      error: { code: 'Unauthenticated', message: 'Connexion requise' },
    });
  });

  it('numéro de session inventé : 401', async () => {
    expect((await current('__Host-session=inventé')).status).toBe(401);
  });

  it('7 jours sans activité : 401, même avant le nettoyage par MongoDB', async () => {
    const cookie = await signUp(app);
    const longAgo = new Date(Date.now() - 7 * DAY - MINUTE);
    await setSessionDates(cookie, {
      createdAt: longAgo,
      lastSeenAt: longAgo,
      expiresAt: new Date(Date.now() + DAY),
    });

    expect((await current(cookie)).status).toBe(401);
  });

  it('30 jours après l’ouverture : 401, même avec une activité récente', async () => {
    const cookie = await signUp(app);
    await setSessionDates(cookie, {
      createdAt: new Date(Date.now() - 30 * DAY - MINUTE),
      lastSeenAt: new Date(Date.now() - MINUTE),
      expiresAt: new Date(Date.now() + DAY),
    });

    expect((await current(cookie)).status).toBe(401);
  });

  it('une activité prolonge la session de 7 jours', async () => {
    const cookie = await signUp(app);
    await setSessionDates(cookie, {
      createdAt: new Date(Date.now() - 10 * DAY),
      lastSeenAt: new Date(Date.now() - 6 * DAY),
      expiresAt: new Date(Date.now() + DAY),
    });

    expect((await current(cookie)).status).toBe(200);

    const session = await SessionModel.findOne({ tokenHash: hashToken(cookie.split('=')[1]!) });
    expect(session!.expiresAt.getTime()).toBeGreaterThan(Date.now() + 7 * DAY - MINUTE);
  });

  it('pas d’écriture en base à chaque requête : au plus une prolongation toutes les 5 minutes', async () => {
    const cookie = await signUp(app);
    const recent = new Date(Date.now() - MINUTE);
    await setSessionDates(cookie, {
      createdAt: recent,
      lastSeenAt: recent,
      expiresAt: new Date(recent.getTime() + 7 * DAY),
    });

    await current(cookie);

    const session = await SessionModel.findOne({ tokenHash: hashToken(cookie.split('=')[1]!) });
    expect(session!.lastSeenAt.getTime()).toBe(recent.getTime());
  });
});

describe('A3 : se déconnecter (story 2)', () => {
  it('204, session détruite côté serveur et cookie effacé', async () => {
    const cookie = await signUp(app);

    const response = await logOut(cookie);

    expect(response.status).toBe(204);
    expect(response.headers['set-cookie']?.[0]).toMatch(
      /^__Host-session=;.*Expires=Thu, 01 Jan 1970/,
    );
    expect(await SessionModel.countDocuments()).toBe(0);
    expect((await current(cookie)).status).toBe(401);
  });

  it('sans session : 204 quand même (opération répétable)', async () => {
    expect((await logOut()).status).toBe(204);
  });

  it('SEC-10 : déconnexion sans l’origine de ListenIn : 403, session intacte', async () => {
    const cookie = await signUp(app);

    const response = await request(app).delete('/api/sessions/current').set('Cookie', cookie);

    expect(response.status).toBe(403);
    expect((await current(cookie)).status).toBe(200);
  });
});

describe('SEC-5 : limites de tentatives de connexion', () => {
  it('le 6e échec en 15 minutes sur une adresse : 429, même avec le bon mot de passe', async () => {
    await signUp(app);
    for (let i = 0; i < 5; i++) {
      expect(
        (await logIn({ email: MEMBER.email, password: `mauvais mot de passe ${i}` })).status,
      ).toBe(401);
    }

    const blocked = await logIn({ email: MEMBER.email, password: MEMBER.password });

    expect(blocked.status).toBe(429);
    expect(blocked.headers['retry-after']).toBeDefined();
    expect(blocked.body).toMatchObject({ error: { code: 'TooManyRequests' } });
  });

  it('le blocage d’une adresse ne bloque pas les autres', async () => {
    await signUp(app);
    for (let i = 0; i < 5; i++) {
      await logIn({ email: MEMBER.email, password: `mauvais mot de passe ${i}` });
    }

    expect((await logIn({ email: 'autre@example.com', password: 'nimporte quoi' })).status).toBe(
      401,
    );
  });

  it('les connexions réussies ne consomment pas la limite d’échecs', async () => {
    await signUp(app);
    for (let i = 0; i < 6; i++) {
      expect((await logIn({ email: MEMBER.email, password: MEMBER.password })).status).toBe(201);
    }
  });

  it('la 101e tentative en 15 minutes depuis une adresse IP : 429', async () => {
    for (let i = 0; i < 100; i++) {
      await logIn({ email: `membre${i}@example.com`, password: 'nimporte quoi' });
    }

    const blocked = await logIn({ email: 'encore@example.com', password: 'nimporte quoi' });

    expect(blocked.status).toBe(429);
  }, 60_000);
});

describe('journaux', () => {
  it('SEC-1 et SEC-4 : ni le mot de passe ni le numéro de session n’apparaissent', async () => {
    let logs = '';
    const sink = new Writable({
      write(chunk: Buffer, _encoding, done) {
        logs += chunk.toString();
        done();
      },
    });
    const logged = createTestApp(sink);
    await signUp(logged);

    const response = await logIn(
      { email: MEMBER.email, password: MEMBER.password },
      undefined,
      logged,
    );
    const token = sessionTokenOf(response)!;
    await request(logged).get('/api/sessions/current').set('Cookie', `__Host-session=${token}`);

    expect(logs).toContain('/api/sessions');
    expect(logs).not.toContain(MEMBER.password);
    expect(logs).not.toContain(token);
  });
});
