import { createApp } from './app.js';
import { loadConfig } from './config.js';
import { createLogger } from './logger.js';

const config = loadConfig();
const logger = createLogger(config);

const server = createApp(logger).listen(config.PORT, () => {
  logger.info({ port: config.PORT }, 'API démarrée');
});

server.on('error', (error) => {
  logger.error({ err: error }, "Impossible d'écouter sur le port");
  process.exit(1);
});

// Un conteneur ou un orchestrateur arrête le processus par SIGTERM : on termine proprement.
function shutdown(signal: string): void {
  logger.info({ signal }, 'Arrêt demandé');
  server.close((error) => {
    if (error) {
      logger.error({ err: error }, "Échec de l'arrêt");
      process.exit(1);
    }
    process.exit(0);
  });
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
