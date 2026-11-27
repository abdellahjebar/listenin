// Routes HTTP du module Profil, montées par app.ts. Elles ne sont pas exportées par index.ts :
// les autres modules n'utilisent que les fonctions de index.ts (MAI-3).
import { Router } from 'express';
import { currentMember, requireSession } from '../identity/index.js';
import {
  getMemberProfile,
  getOwnProfile,
  saveOwnProfile,
  type ProfileUpdate,
} from './profiles.service.js';

export function createProfilesRouter(): Router {
  const router = Router();

  // Toutes les routes du profil sont réservées aux membres connectés (A4 à A7) : 401 sinon.
  router.use(requireSession);

  router.get('/me', async (_req, res) => {
    res.json(await getOwnProfile(currentMember(res).accountId));
  });

  router.put('/me', async (req, res) => {
    // Le corps a déjà été validé par le contrat (listes fermées, longueurs, contact).
    res.json(await saveOwnProfile(currentMember(res).accountId, req.body as ProfileUpdate));
  });

  router.get('/:memberId', async (req, res) => {
    res.json(await getMemberProfile(req.params.memberId));
  });

  return router;
}
