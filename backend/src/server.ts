import type { Server } from 'node:http';
import { createApp } from './app.js';
import { loadConfig } from './config.js';
import { connectDatabase, disconnectDatabase } from './database.js';
import { createLogger } from './logger.js';

const config = loadConfig();
const logger = createLogger(config);

// Sans base, l'API ne peut rien servir d'utile : elle refuse de démarrer.
try {
  await connectDatabase(config.MONGODB_URI, logger);
} catch (error) {
  logger.fatal({ err: error }, 'Impossible de se connecter à MongoDB');
  process.exit(1);
}

const server: Server = createApp(logger, {
  appOrigin: config.APP_ORIGIN,
  trustProxy: config.TRUST_PROXY,
}).listen(config.PORT, () => {
  logger.info({ port: config.PORT }, 'API démarrée');
});

server.on('error', (error) => {
  logger.error({ err: error }, "Impossible d'écouter sur le port");
  process.exit(1);
});

// Un conteneur ou un orchestrateur arrête le processus par SIGTERM : on termine proprement,
// d'abord les requêtes en cours, puis la connexion à la base.
function shutdown(signal: string): void {
  logger.info({ signal }, 'Arrêt demandé');
  server.close((error) => {
    if (error) {
      logger.error({ err: error }, "Échec de l'arrêt du serveur");
      process.exit(1);
    }
    disconnectDatabase()
      .then(() => process.exit(0))
      .catch((closeError: unknown) => {
        logger.error({ err: closeError }, 'Échec de la fermeture de la connexion à MongoDB');
        process.exit(1);
      });
  });
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
