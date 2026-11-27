import type { Express } from 'express';
import type { DestinationStream } from 'pino';
import { createApp, type AppOptions } from '../../src/app.js';
import { createLogger } from '../../src/logger.js';

export const TEST_ORIGIN = 'https://listenin.test';

/** L'application telle qu'en production, avec en plus la validation des réponses (ADR 0007). */
export function createTestApp(
  logs?: DestinationStream,
  options: Partial<AppOptions> = {},
): Express {
  const logger = createLogger({ NODE_ENV: logs ? 'development' : 'test', LOG_LEVEL: 'info' }, logs);
  return createApp(logger, { appOrigin: TEST_ORIGIN, validateResponses: true, ...options });
}
