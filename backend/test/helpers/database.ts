import { randomUUID } from 'node:crypto';
import { afterAll, afterEach, beforeAll, inject } from 'vitest';
import { connectDatabase, disconnectDatabase, mongoose } from '../../src/database.js';
import { createLogger } from '../../src/logger.js';

/**
 * À appeler en tête d'un fichier de test qui a besoin de la base : une base neuve par fichier,
 * vidée après chaque test, supprimée à la fin.
 */
export function useTestDatabase(): void {
  beforeAll(async () => {
    await connectDatabase(
      inject('mongoUri'),
      createLogger({ NODE_ENV: 'test', LOG_LEVEL: 'info' }),
      { dbName: `test-${randomUUID()}` },
    );
  });

  afterEach(async () => {
    const collections = await mongoose.connection.db?.collections();
    await Promise.all((collections ?? []).map((collection) => collection.deleteMany({})));
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await disconnectDatabase();
  });
}
