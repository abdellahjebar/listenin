import { pino, type DestinationStream, type Logger } from 'pino';
import type { Config } from './config.js';

/** Secrets masqués dans les journaux : les lire permettrait d'usurper un compte ou une session. */
export const REDACTED_PATHS = [
  'req.headers.authorization',
  'req.headers.cookie',
  'res.headers["set-cookie"]',
  'req.body.password',
];

/** `destination` permet aux tests de lire les journaux ; par défaut, la sortie standard. */
export function createLogger(
  config: Pick<Config, 'NODE_ENV' | 'LOG_LEVEL'>,
  destination?: DestinationStream,
): Logger {
  const options = {
    level: config.NODE_ENV === 'test' ? 'silent' : config.LOG_LEVEL,
    redact: REDACTED_PATHS,
  };
  return destination ? pino(options, destination) : pino(options);
}
