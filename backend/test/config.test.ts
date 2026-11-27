import { describe, expect, it } from 'vitest';
import { loadConfig } from '../src/config.js';

const MONGODB_URI = 'mongodb://localhost:27017/listenin';
const APP_ORIGIN = 'http://localhost:4200';

describe('loadConfig', () => {
  it('applique les valeurs par défaut', () => {
    expect(loadConfig({ MONGODB_URI, APP_ORIGIN })).toEqual({
      NODE_ENV: 'development',
      PORT: 3000,
      LOG_LEVEL: 'info',
      APP_ORIGIN,
      TRUST_PROXY: 0,
      MONGODB_URI,
    });
  });

  it('convertit PORT en nombre', () => {
    expect(loadConfig({ MONGODB_URI, APP_ORIGIN, PORT: '8080' }).PORT).toBe(8080);
  });

  it('rejette un PORT invalide', () => {
    expect(() => loadConfig({ MONGODB_URI, APP_ORIGIN, PORT: 'abc' })).toThrow(
      'Configuration invalide',
    );
  });

  it('rejette un NODE_ENV inconnu', () => {
    expect(() => loadConfig({ MONGODB_URI, APP_ORIGIN, NODE_ENV: 'staging' })).toThrow(
      'Configuration invalide',
    );
  });

  it('exige MONGODB_URI', () => {
    expect(() => loadConfig({ APP_ORIGIN })).toThrow('MONGODB_URI');
  });

  it('exige APP_ORIGIN sous forme d’origine, sans chemin', () => {
    expect(() => loadConfig({ MONGODB_URI })).toThrow('APP_ORIGIN');
    expect(() => loadConfig({ MONGODB_URI, APP_ORIGIN: 'https://listenin.example/' })).toThrow(
      'APP_ORIGIN',
    );
  });

  it('rejette une adresse qui n’est pas MongoDB, sans la recopier dans le message', () => {
    expect(() =>
      loadConfig({ APP_ORIGIN, MONGODB_URI: 'postgres://user:motdepasse@hote/base' }),
    ).toThrow(/^(?!.*motdepasse).*MONGODB_URI/);
  });
});
