import { describe, expect, it } from 'vitest';
import { hashPassword, verifyPassword } from '../../src/modules/identity/password.js';

const PASSWORD = 'une phrase de passe assez longue';

describe('hachage des mots de passe (SEC-1)', () => {
  it('produit une empreinte Argon2id au format PHC avec les paramètres de l’ADR 0006', async () => {
    const hash = await hashPassword(PASSWORD);

    expect(hash).toMatch(
      /^\$argon2id\$v=19\$m=19456,t=2,p=1\$[A-Za-z0-9+/]{22}\$[A-Za-z0-9+/]{43}$/,
    );
    expect(hash).not.toContain(PASSWORD);
  });

  it('accepte le bon mot de passe et refuse un autre', async () => {
    const hash = await hashPassword(PASSWORD);

    await expect(verifyPassword(PASSWORD, hash)).resolves.toBe(true);
    await expect(verifyPassword(`${PASSWORD}!`, hash)).resolves.toBe(false);
  });

  it('utilise un sel aléatoire : deux empreintes du même mot de passe diffèrent', async () => {
    expect(await hashPassword(PASSWORD)).not.toBe(await hashPassword(PASSWORD));
  });

  it('vérifie avec les paramètres enregistrés dans l’empreinte', async () => {
    const hash = await hashPassword(PASSWORD, { memory: 64, passes: 1, parallelism: 1 });

    expect(hash).toContain('$m=64,t=1,p=1$');
    await expect(verifyPassword(PASSWORD, hash)).resolves.toBe(true);
  });

  it('vérifie une empreinte produite par une autre implémentation (bibliothèque argon2 0.45)', async () => {
    const reference =
      '$argon2id$v=19$m=19456,t=2,p=1$/e3AXz/fjAGOPYSz8C5L6Q$KEje/WEVNMUgex2qdM/LP7JfSXUzcPMhqb01WWhn71Q';

    await expect(verifyPassword(PASSWORD, reference)).resolves.toBe(true);
  });

  it('signale une empreinte illisible au lieu de répondre « faux »', async () => {
    await expect(verifyPassword(PASSWORD, 'motdepasse-en-clair')).rejects.toThrow('illisible');
  });
});
