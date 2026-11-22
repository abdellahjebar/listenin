import { Writable } from 'node:stream';
import request from 'supertest';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AccountModel } from '../../src/modules/identity/account.model.js';
import { hashToken } from '../../src/modules/identity/sessions.js';
import { SessionModel } from '../../src/modules/identity/session.model.js';
import { ProfileModel } from '../../src/modules/profile/profile.model.js';
import { createTestApp, TEST_ORIGIN } from '../helpers/app.js';
import { useTestDatabase } from '../helpers/database.js';

useTestDatabase();

const valid = {
  name: 'Ada Lovelace',
  email: 'Ada@Example.com',
  password: 'une phrase de passe assez longue',
  acceptTerms: true,
};

function signup(body: object, app = createTestApp()) {
  return request(app).post('/api/accounts').set('Origin', TEST_ORIGIN).send(body);
}

function sessionCookie(response: request.Response): string | undefined {
  const cookies = response.headers['set-cookie'] as unknown as string[] | undefined;
  return cookies?.find((cookie) => cookie.startsWith('__Host-session='));
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('A1 : s’inscrire (story 1)', () => {
  it('crée le compte, le profil et la session, puis connecte le membre (201)', async () => {
    const response = await signup(valid);

    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      id: expect.stringMatching(/^[0-9a-f]{24}$/) as string,
      name: 'Ada Lovelace',
      email: 'ada@example.com',
    });

    const account = await AccountModel.findById((response.body as { id: string }).id);
    expect(account?.email).toBe('ada@example.com');
    expect(await ProfileModel.findOne({ accountId: account?._id })).toMatchObject({
      name: 'Ada Lovelace',
    });
    expect(await SessionModel.countDocuments({ accountId: account?._id })).toBe(1);
  });

  it('pose un cookie de session HttpOnly, Secure, SameSite=Strict, préfixé __Host-', async () => {
    const cookie = sessionCookie(await signup(valid));

    expect(cookie).toBeDefined();
    expect(cookie).toMatch(/; HttpOnly/);
    expect(cookie).toMatch(/; Secure/);
    expect(cookie).toMatch(/; SameSite=Strict/);
    expect(cookie).toMatch(/; Path=\//);
    expect(cookie).not.toMatch(/Domain=/);
  });

  it('enregistre en base le hachage du numéro de session, jamais le numéro lui-même', async () => {
    const cookie = sessionCookie(await signup(valid))!;
    const token = cookie.split(';')[0]!.split('=')[1]!;

    expect(await SessionModel.findOne({ tokenHash: hashToken(token) })).not.toBeNull();
    expect(await SessionModel.findOne({ tokenHash: token })).toBeNull();
  });

  it('ne stocke qu’une empreinte Argon2id et ne renvoie jamais le mot de passe (SEC-1)', async () => {
    const response = await signup(valid);
    const account = await AccountModel.findById((response.body as { id: string }).id).lean();

    expect(account?.passwordHash).toMatch(/^\$argon2id\$/);
    expect(JSON.stringify(account)).not.toContain(valid.password);
    expect(JSON.stringify(response.body)).not.toContain(valid.password);
  });

  it('enregistre l’acceptation des conditions avec sa date et sa version (invariant 7)', async () => {
    const before = new Date();
    const response = await signup(valid);
    const account = await AccountModel.findById((response.body as { id: string }).id);

    expect(account?.termsAcceptance.version).toBe('0-brouillon');
    expect(account?.termsAcceptance.acceptedAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
  });

  it('accepte un mot de passe de 64 caractères, sans règle de composition', async () => {
    expect((await signup({ ...valid, password: 'a'.repeat(64) })).status).toBe(201);
  });
});

describe('A1 : inscriptions refusées', () => {
  it('conditions non acceptées : 400 et aucun compte', async () => {
    const response = await signup({ ...valid, acceptTerms: false });

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({
      error: { code: 'ValidationError', details: [{ target: 'acceptTerms' }] },
    });
    expect(await AccountModel.countDocuments()).toBe(0);
  });

  it('mot de passe de 14 caractères : 400 sur le champ password', async () => {
    const response = await signup({ ...valid, password: 'a'.repeat(14) });

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({ error: { details: [{ target: 'password' }] } });
  });

  it('mot de passe de plus de 128 caractères : 400', async () => {
    expect((await signup({ ...valid, password: 'a'.repeat(129) })).status).toBe(400);
  });

  it('adresse e-mail invalide : 400 sur le champ email et aucun compte', async () => {
    const response = await signup({ ...valid, email: 'pas-une-adresse' });

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({ error: { details: [{ target: 'email' }] } });
    expect(await AccountModel.countDocuments()).toBe(0);
  });

  it('nom vide ou fait d’espaces : 400 sur le champ name', async () => {
    const response = await signup({ ...valid, name: '   ' });

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({ error: { details: [{ target: 'name' }] } });
  });

  it('champ en trop : 400 (aucune donnée non prévue n’entre)', async () => {
    expect((await signup({ ...valid, role: 'admin' })).status).toBe(400);
  });

  it('adresse déjà utilisée, même avec d’autres majuscules : 409 avec un message clair', async () => {
    const app = createTestApp();
    await signup(valid, app);

    const response = await signup({ ...valid, email: 'ADA@example.COM' }, app);

    expect(response.status).toBe(409);
    expect(response.body).toEqual({
      error: { code: 'EmailAlreadyUsed', message: 'Cette adresse e-mail est déjà utilisée' },
    });
    expect(await AccountModel.countDocuments()).toBe(1);
  });

  it('échec de création du profil : le compte est supprimé (compensation)', async () => {
    vi.spyOn(ProfileModel, 'create').mockRejectedValueOnce(new Error('panne simulée'));

    const response = await signup(valid);

    expect(response.status).toBe(500);
    expect(await AccountModel.countDocuments()).toBe(0);
    expect(await SessionModel.countDocuments()).toBe(0);
  });
});

describe('protections de l’inscription', () => {
  it('SEC-10 : origine absente : 403', async () => {
    const response = await request(createTestApp()).post('/api/accounts').send(valid);

    expect(response.status).toBe(403);
    expect(response.body).toMatchObject({ error: { code: 'ForbiddenOrigin' } });
    expect(await AccountModel.countDocuments()).toBe(0);
  });

  it('SEC-10 : origine étrangère : 403', async () => {
    const response = await request(createTestApp())
      .post('/api/accounts')
      .set('Origin', 'https://site-malveillant.example')
      .send(valid);

    expect(response.status).toBe(403);
  });

  it('SEC-5 : la 11e inscription de l’heure depuis la même adresse IP : 429 avec Retry-After', async () => {
    const app = createTestApp();
    // Seules les requêtes conformes au contrat atteignent le limiteur : une requête invalide ne
    // coûte aucun hachage et ne révèle rien.
    for (let i = 0; i < 10; i++) {
      await signup({ ...valid, email: `membre${i}@example.com` }, app);
    }

    const response = await signup(valid, app);

    expect(response.status).toBe(429);
    expect(response.headers['retry-after']).toBeDefined();
    expect(response.body).toMatchObject({ error: { code: 'TooManyRequests' } });
    expect(await AccountModel.countDocuments({ email: 'ada@example.com' })).toBe(0);
  });

  it('SEC-1 et SEC-4 : ni le mot de passe ni le numéro de session n’apparaissent dans les journaux', async () => {
    let logs = '';
    const sink = new Writable({
      write(chunk: Buffer, _encoding, done) {
        logs += chunk.toString();
        done();
      },
    });

    const response = await signup(valid, createTestApp(sink));
    const token = sessionCookie(response)!.split(';')[0]!.split('=')[1]!;

    expect(response.status).toBe(201);
    expect(logs).toContain('/api/accounts');
    expect(logs).not.toContain(valid.password);
    expect(logs).not.toContain(token);
  });
});
