import { mongoose } from '../../database.js';

/** Ce que le musicien publie sur lui. Au palier 1 de cette tranche : son nom. */
export interface Profile {
  accountId: mongoose.Types.ObjectId;
  name: string;
}

const profileSchema = new mongoose.Schema<Profile>(
  {
    // Un compte a exactement un profil (DOMAIN.md).
    accountId: { type: mongoose.Schema.Types.ObjectId, required: true, unique: true },
    name: { type: String, required: true, trim: true, minlength: 1, maxlength: 100 },
  },
  { timestamps: true },
);

export const ProfileModel = mongoose.model<Profile>('Profile', profileSchema);
