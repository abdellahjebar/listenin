// Interface publique du module Profil : les autres modules n'importent que ce fichier (MAI-3).
import type { mongoose } from '../../database.js';
import { ProfileModel } from './profile.model.js';

export async function createProfile(
  accountId: mongoose.Types.ObjectId,
  name: string,
): Promise<void> {
  await ProfileModel.create({ accountId, name });
}

/** Le nom affiché d'un membre, ou null si son profil n'existe pas. */
export async function findProfileName(accountId: mongoose.Types.ObjectId): Promise<string | null> {
  const profile = await ProfileModel.findOne({ accountId }, { name: 1 }).lean();
  return profile?.name ?? null;
}
