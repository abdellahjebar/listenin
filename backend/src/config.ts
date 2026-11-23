import { z } from 'zod';

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).default('info'),
  // Obligatoire, sans valeur par défaut : l'adresse peut contenir un mot de passe (jamais journalisée).
  // Adresse de l'application web, attendue dans l'en-tête Origin des requêtes qui modifient
  // des données (SEC-10). Sans chemin ni barre finale : https://listenin.example
  APP_ORIGIN: z.string().regex(/^https?:\/\/[^/]+$/, 'doit être une origine, sans chemin'),
  MONGODB_URI: z
    .string()
    .regex(/^mongodb(\+srv)?:\/\//, 'doit commencer par mongodb:// ou mongodb+srv://'),
});

export type Config = z.infer<typeof schema>;

/** Valide l'environnement au démarrage : une configuration incorrecte doit échouer tôt et clairement. */
export function loadConfig(env: NodeJS.ProcessEnv = process.env): Config {
  const result = schema.safeParse(env);
  if (!result.success) {
    const details = result.error.issues
      .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
      .join('; ');
    throw new Error(`Configuration invalide : ${details}`);
  }
  return result.data;
}
