import type { components } from '../../api/schema.js';
import { mongoose } from '../../database.js';
import { ApiError } from '../../middleware/errors.js';
import { ProfileModel, type ProfileDocument } from './profile.model.js';

export type ProfileView = components['schemas']['Profile'];
export type ProfileUpdate = components['schemas']['ProfileUpdate'];

/** Le profil tel que le contrat le décrit ; memberId est l'identifiant du compte. */
function toView(profile: ProfileDocument): ProfileView {
  return {
    memberId: profile.accountId.toString(),
    name: profile.name,
    instruments: profile.instruments as ProfileView['instruments'],
    genres: profile.genres as ProfileView['genres'],
    city: profile.city,
    bio: profile.bio,
    contact: profile.contact,
  };
}

/** Mon profil ; 404 ProfileMissing s'il manque (arrêt brutal pendant l'inscription). */
export async function getOwnProfile(accountId: mongoose.Types.ObjectId): Promise<ProfileView> {
  const profile = await ProfileModel.findOne({ accountId }).lean();
  if (!profile) {
    throw new ApiError(404, 'ProfileMissing', 'Profil à compléter');
  }
  return toView(profile);
}

/** Enregistre mon profil, ou le crée s'il manque (A4 : seulement le sien, aucune autre route). */
export async function saveOwnProfile(
  accountId: mongoose.Types.ObjectId,
  update: ProfileUpdate,
): Promise<ProfileView> {
  const profile = await ProfileModel.findOneAndUpdate(
    { accountId },
    {
      $set: {
        name: update.name,
        instruments: update.instruments,
        genres: update.genres,
        city: update.city,
        bio: update.bio,
        contact: update.contact,
      },
    },
    { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true, lean: true },
  );
  if (!profile) {
    // Impossible avec upsert ; vérifié pour le typage plutôt que supposé.
    throw new Error('Profil non enregistré malgré upsert');
  }
  return toView(profile);
}

/** Le profil d'un membre (A6, A7) ; 404 s'il n'existe pas. */
export async function getMemberProfile(memberId: string): Promise<ProfileView> {
  const profile = await ProfileModel.findOne({
    accountId: new mongoose.Types.ObjectId(memberId),
  }).lean();
  if (!profile) {
    throw new ApiError(404, 'NotFound', 'Ressource inconnue');
  }
  return toView(profile);
}
