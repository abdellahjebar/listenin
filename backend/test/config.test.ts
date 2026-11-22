import { describe, expect, it } from 'vitest';
import { loadConfig } from '../src/config.js';

const MONGODB_URI = 'mongodb://localhost:27017/listenin';

describe('loadConfig', () => {
  it('applique les valeurs par défaut', () => {
    expect(loadConfig({ MONGODB_URI })).toEqual({
      NODE_ENV: 'development',
      PORT: 3000,
      LOG_LEVEL: 'info',
      MONGODB_URI,
    });
  });

  it('convertit PORT en nombre', () => {
    expect(loadConfig({ MONGODB_URI, PORT: '8080' }).PORT).toBe(8080);
  });

  it('rejette un PORT invalide', () => {
    expect(() => loadConfig({ MONGODB_URI, PORT: 'abc' })).toThrow('Configuration invalide');
  });

  it('rejette un NODE_ENV inconnu', () => {
    expect(() => loadConfig({ MONGODB_URI, NODE_ENV: 'staging' })).toThrow(
      'Configuration invalide',
    );
  });

  it('exige MONGODB_URI', () => {
    expect(() => loadConfig({})).toThrow('MONGODB_URI');
  });

  it('rejette une adresse qui n’est pas MongoDB, sans la recopier dans le message', () => {
    expect(() => loadConfig({ MONGODB_URI: 'postgres://user:motdepasse@hote/base' })).toThrow(
      /^(?!.*motdepasse).*MONGODB_URI/,
    );
  });
});
