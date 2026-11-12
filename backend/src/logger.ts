import { pino, type Logger } from 'pino';
import type { Config } from './config.js';

export function createLogger(config: Pick<Config, 'NODE_ENV' | 'LOG_LEVEL'>): Logger {
  return pino({
    level: config.NODE_ENV === 'test' ? 'silent' : config.LOG_LEVEL,
    // Un jeton ou un cookie dans les journaux permettrait d'usurper une session.
    redact: ['req.headers.authorization', 'req.headers.cookie'],
  });
}
