import { argon2, randomBytes, timingSafeEqual } from 'node:crypto';

/** Paramètres Argon2id : au minimum 19 Mio, 2 passes, 1 fil (OWASP, ADR 0006). */
export interface HashParameters {
  /** Mémoire, en blocs de 1 Kio. */
  memory: number;
  passes: number;
  parallelism: number;
}

export const DEFAULT_PARAMETERS: HashParameters = { memory: 19 * 1024, passes: 2, parallelism: 1 };

const SALT_BYTES = 16;
const TAG_BYTES = 32;

function derive(password: string, salt: Buffer, parameters: HashParameters): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    argon2(
      'argon2id',
      { message: password, nonce: salt, tagLength: TAG_BYTES, ...parameters },
      (error, key) => (error ? reject(error) : resolve(key)),
    );
  });
}

const toBase64 = (bytes: Buffer): string => bytes.toString('base64').replace(/=+$/, '');

/**
 * Hache un mot de passe au format standard PHC, qui contient tout ce qu'il faut pour le vérifier :
 * `$argon2id$v=19$m=19456,t=2,p=1$<sel>$<empreinte>` (base64 sans remplissage).
 */
export async function hashPassword(
  password: string,
  parameters: HashParameters = DEFAULT_PARAMETERS,
): Promise<string> {
  const salt = randomBytes(SALT_BYTES);
  const key = await derive(password, salt, parameters);
  const { memory, passes, parallelism } = parameters;
  return `$argon2id$v=19$m=${memory},t=${passes},p=${parallelism}$${toBase64(salt)}$${toBase64(key)}`;
}

const PHC = /^\$argon2id\$v=19\$m=(\d+),t=(\d+),p=(\d+)\$([A-Za-z0-9+/]+)\$([A-Za-z0-9+/]+)$/;

/**
 * Vérifie un mot de passe avec les paramètres enregistrés dans l'empreinte, ce qui permettra
 * de les renforcer plus tard sans invalider les anciens comptes. Comparaison en temps constant.
 */
export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const match = PHC.exec(stored);
  if (!match) {
    throw new Error('Empreinte de mot de passe illisible');
  }
  const [, memory, passes, parallelism, salt, expected] = match as unknown as [
    string,
    string,
    string,
    string,
    string,
    string,
  ];
  const expectedKey = Buffer.from(expected, 'base64');
  const key = await derive(password, Buffer.from(salt, 'base64'), {
    memory: Number(memory),
    passes: Number(passes),
    parallelism: Number(parallelism),
  });
  return key.length === expectedKey.length && timingSafeEqual(key, expectedKey);
}
