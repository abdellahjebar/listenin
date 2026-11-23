import { Router } from 'express';
import type { components } from '../../api/schema.js';
import { limitRequests } from '../../middleware/rate-limit.js';
import { registerAccount } from './accounts.service.js';
import { setSessionCookie } from './sessions.js';

type NewAccount = components['schemas']['NewAccount'];
type Account = components['schemas']['Account'];

/** Une fabrique : chaque application (et chaque test) a ses propres compteurs de tentatives. */
export function createAccountsRouter(): Router {
  const router = Router();

  // Inscription : 10 par heure par adresse IP (ADR 0006).
  router.post('/', limitRequests({ limit: 10, windowMs: 60 * 60 * 1000 }), async (req, res) => {
    // Le corps a déjà été validé par le contrat (express-openapi-validator).
    const { name, email, password } = req.body as NewAccount;
    const registered = await registerAccount({ name, email, password }, req.log);

    setSessionCookie(res, registered.sessionToken);
    const body: Account = { id: registered.id, name: registered.name, email: registered.email };
    res.status(201).json(body);
  });

  return router;
}
