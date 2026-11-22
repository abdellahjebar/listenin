import { MongoMemoryServer } from 'mongodb-memory-server';
import type { TestProject } from 'vitest/node';

declare module 'vitest' {
  export interface ProvidedContext {
    mongoUri: string;
  }
}

/**
 * Une base MongoDB en mémoire pour toute la suite de tests ; chaque fichier de test y crée
 * sa propre base (voir helpers/database.ts). La version est fixée dans package.json.
 */
export default async function setup(project: TestProject): Promise<() => Promise<void>> {
  // Le premier démarrage peut être lent (téléchargement, analyse antivirus sous Windows).
  const server = await MongoMemoryServer.create({ instance: { launchTimeout: 60_000 } });
  project.provide('mongoUri', server.getUri());

  return async () => {
    await server.stop();
  };
}
