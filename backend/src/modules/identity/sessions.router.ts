import { Router } from 'express';
import type { components } from '../../api/schema.js';
import { limitRequests } from '../../middleware/rate-limit.js';
import { currentMember, requireSession } from './require-session.js';
import { clearSessionCookie, sessionTokenFrom, setSessionCookie } from './sessions.js';
import { describeMember, logIn, logOut } from './sessions.service.js';

type Credentials = components['schemas']['Credentials'];
type Account = components['schemas']['Account'];

const FIFTEEN_MINUTES = 15 * 60 * 1000;

/** Une fabrique : chaque application (et chaque test) a ses propres compteurs de tentatives. */
export function createSessionsRouter(): Router {
  const router = Router();

  router.post(
    '/',
    // Toutes adresses confondues : contre l'essai d'un mot de passe sur beaucoup de comptes.
    limitRequests({ limit: 100, windowMs: FIFTEEN_MINUTES }),
    // Par adresse visée, échecs seulement : contre l'essai de beaucoup de mots de passe sur un compte.
    limitRequests({
      limit: 5,
      windowMs: FIFTEEN_MINUTES,
      failuresOnly: true,
      keyWith: (req) =>
        String((req.body as Partial<Credentials>).email ?? '')
          .trim()
          .toLowerCase(),
    }),
    async (req, res) => {
      const { email, password } = req.body as Credentials;
      const { member, sessionToken } = await logIn(
        { email, password },
        sessionTokenFrom(req.cookies),
        req.log,
      );
      setSessionCookie(res, sessionToken);
      res.status(201).json(member satisfies Account);
    },
  );

  router.get('/current', requireSession, async (req, res) => {
    const member = await describeMember(currentMember(res).accountId, req.log);
    res.json(member satisfies Account);
  });

  router.delete('/current', async (req, res) => {
    await logOut(sessionTokenFrom(req.cookies));
    clearSessionCookie(res);
    res.status(204).end();
  });

  return router;
}
