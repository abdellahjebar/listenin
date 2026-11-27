import type { Express } from 'express';
import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';
import { ProfileModel } from '../../src/modules/profile/profile.model.js';
import { createTestApp, TEST_ORIGIN } from '../helpers/app.js';
import { useTestDatabase } from '../helpers/database.js';
import { MEMBER, signUp } from '../helpers/session.js';

useTestDatabase();

const COMPLETE = {
  name: 'Ada Lovelace',
  instruments: ['electric-guitar', 'bass-guitar'],
  genres: ['blues', 'jazz'],
  city: 'Nice',
  bio: 'Guitariste blues, je cherche un groupe pour jouer en live.',
  contact: 'https://instagram.com/ada.guitar',
};

let app: Express;

beforeEach(() => {
  app = createTestApp();
});

const getMine = (cookie?: string) => {
  const req = request(app).get('/api/profiles/me');
  return cookie ? req.set('Cookie', cookie) : req;
};
const saveMine = (body: object, cookie?: string) => {
  const req = request(app).put('/api/profiles/me').set('Origin', TEST_ORIGIN);
  return (cookie ? req.set('Cookie', cookie) : req).send(body);
};
const getMember = (memberId: string, cookie?: string) => {
  const req = request(app).get(`/api/profiles/${memberId}`);
  return cookie ? req.set('Cookie', cookie) : req;
};
async function memberIdOf(cookie: string): Promise<string> {
  const res = await request(app).get('/api/sessions/current').set('Cookie', cookie);
  return (res.body as { id: string }).id;
}

describe('A4 : remplir son profil (story 3)', () => {
  it('après l’inscription : le nom, des listes vides, aucun contact', async () => {
    const cookie = await signUp(app);

    const res = await getMine(cookie);

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      name: MEMBER.name,
      instruments: [],
      genres: [],
      city: '',
      bio: '',
      contact: null,
    });
  });

  it('enregistre le profil complet, puis le relit à l’identique', async () => {
    const cookie = await signUp(app);

    const saved = await saveMine(COMPLETE, cookie);
    const read = await getMine(cookie);

    expect(saved.status).toBe(200);
    expect(read.body).toEqual({ memberId: await memberIdOf(cookie), ...COMPLETE });
  });

  it('A4 : un visiteur ne peut pas modifier un profil (401)', async () => {
    expect((await saveMine(COMPLETE)).status).toBe(401);
  });

  it('A4 : aucune route ne permet de modifier le profil d’un autre (405)', async () => {
    const other = await signUp(app, { ...MEMBER, email: 'autre@example.com' });
    const cookie = await signUp(app);

    const res = await request(app)
      .put(`/api/profiles/${await memberIdOf(other)}`)
      .set('Origin', TEST_ORIGIN)
      .set('Cookie', cookie)
      .send(COMPLETE);

    expect(res.status).toBe(405);
  });

  it('SEC-10 : modification sans l’origine de ListenIn (403)', async () => {
    const cookie = await signUp(app);

    const res = await request(app).put('/api/profiles/me').set('Cookie', cookie).send(COMPLETE);

    expect(res.status).toBe(403);
  });

  it.each([
    ['nom vide', { name: '   ' }, 'name'],
    ['présentation de 1001 caractères', { bio: 'a'.repeat(1001) }, 'bio'],
    ['instrument inconnu', { instruments: ['kazoo'] }, 'instruments.0'],
    ['instrument en double', { instruments: ['drums', 'drums'] }, 'instruments'],
    ['11 genres', { genres: Array.from({ length: 11 }, () => 'rock') }, 'genres'],
    ['contact en http', { contact: 'http://site.fr' }, 'contact'],
    ['contact quelconque', { contact: 'pas un contact' }, 'contact'],
  ])('refuse : %s (400 sur le champ concerné, rien d’enregistré)', async (_cas, change, target) => {
    const cookie = await signUp(app);

    const res = await saveMine({ ...COMPLETE, ...change }, cookie);

    expect(res.status).toBe(400);
    const targets = (res.body as { error: { details: { target: string }[] } }).error.details.map(
      (detail) => detail.target,
    );
    expect(targets).toContain(target);
    expect((await getMine(cookie)).body).toMatchObject({ instruments: [], bio: '' });
  });
});

describe('A5 : afficher ou retirer son contact (story 4)', () => {
  it('accepte une adresse e-mail', async () => {
    const cookie = await signUp(app);

    const res = await saveMine({ ...COMPLETE, contact: 'ada@example.com' }, cookie);

    expect(res.body).toMatchObject({ contact: 'ada@example.com' });
  });

  it('retirer le contact : il n’apparaît plus nulle part', async () => {
    const cookie = await signUp(app);
    const viewer = await signUp(app, { ...MEMBER, email: 'lecteur@example.com' });
    await saveMine(COMPLETE, cookie);

    await saveMine({ ...COMPLETE, contact: null }, cookie);

    expect((await getMine(cookie)).body).toMatchObject({ contact: null });
    expect((await getMember(await memberIdOf(cookie), viewer)).body).toMatchObject({
      contact: null,
    });
  });
});

describe('A6 et A7 : consulter le profil d’un musicien (story 5)', () => {
  it('A6, A7 : un membre voit le profil d’un autre, contact compris', async () => {
    const owner = await signUp(app);
    const viewer = await signUp(app, { ...MEMBER, email: 'lecteur@example.com' });
    await saveMine(COMPLETE, owner);

    const res = await getMember(await memberIdOf(owner), viewer);

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ name: COMPLETE.name, contact: COMPLETE.contact });
  });

  it('A6 : un visiteur ne voit aucun profil, donc aucun contact (401)', async () => {
    const owner = await signUp(app);
    await saveMine(COMPLETE, owner);

    const res = await getMember(await memberIdOf(owner));

    expect(res.status).toBe(401);
    expect(JSON.stringify(res.body)).not.toContain('instagram');
  });

  it('profil inconnu : 404 ; identifiant mal formé : 400', async () => {
    const viewer = await signUp(app);

    expect((await getMember('0123456789abcdef01234567', viewer)).status).toBe(404);
    expect((await getMember('pas-un-identifiant', viewer)).status).toBe(400);
  });
});

describe('profil absent (arrêt brutal pendant l’inscription)', () => {
  it('404 ProfileMissing, puis l’enregistrement le crée', async () => {
    const cookie = await signUp(app);
    await ProfileModel.deleteMany({});

    const missing = await getMine(cookie);
    expect(missing.status).toBe(404);
    expect(missing.body).toMatchObject({ error: { code: 'ProfileMissing' } });

    expect((await saveMine(COMPLETE, cookie)).status).toBe(200);
    expect((await getMine(cookie)).body).toMatchObject({ name: COMPLETE.name, city: 'Nice' });
  });
});
