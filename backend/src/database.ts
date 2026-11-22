import mongoose from 'mongoose';
import type { Logger } from 'pino';

/**
 * Réglages globaux de Mongoose (ADR 0008). Ils doivent précéder toute définition de schéma :
 * les modules importent donc `mongoose` depuis ce fichier, jamais directement.
 * - sanitizeFilter : un opérateur ($ne, $gt…) venu d'une requête est neutralisé (ADR 0005).
 * - strict et strictQuery en mode erreur : un champ inconnu est refusé, jamais ignoré en silence.
 *   Ignoré en silence, un filtre sur un champ mal nommé deviendrait « tous les documents ».
 * - autoIndex désactivé : les index sont créés au démarrage par ensureIndexes, et une erreur
 *   (doublon existant sur un index unique, par exemple) empêche l'API de démarrer.
 */
mongoose.set('sanitizeFilter', true);
mongoose.set('strict', 'throw');
mongoose.set('strictQuery', 'throw');
mongoose.set('autoIndex', false);

export { mongoose };

/** Crée les index déclarés par les schémas de tous les modules. */
export async function ensureIndexes(): Promise<void> {
  await Promise.all(Object.values(mongoose.models).map((model) => model.createIndexes()));
}

/** Ouvre la connexion, puis crée les index. L'adresse n'est jamais journalisée. */
export async function connectDatabase(
  uri: string,
  logger: Logger,
  options: { dbName?: string } = {},
): Promise<void> {
  mongoose.connection.on('disconnected', () => logger.warn('Connexion à MongoDB perdue'));
  mongoose.connection.on('reconnected', () => logger.info('Connexion à MongoDB rétablie'));

  await mongoose.connect(uri, { serverSelectionTimeoutMS: 10_000, ...options });
  await ensureIndexes();
  logger.info({ database: mongoose.connection.name }, 'Connecté à MongoDB');
}

export async function disconnectDatabase(): Promise<void> {
  await mongoose.disconnect();
}
