// Interface publique du module Profil : les autres modules n'importent que ce fichier (MAI-3).
import type { mongoose } from '../../database.js';
import { ProfileModel } from './profile.model.js';

export async function createProfile(
  accountId: mongoose.Types.ObjectId,
  name: string,
): Promise<void> {
  await ProfileModel.create({ accountId, name });
}
