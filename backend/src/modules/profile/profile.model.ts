import { mongoose } from '../../database.js';

/**
 * Ce que le musicien publie sur lui (stories 3, 4). Les codes d'instruments et de genres sont
 * vérifiés par le contrat OpenAPI, seule source des listes fermées (ADR 0011) : ce schéma garde
 * la forme et les longueurs, sans recopier les listes.
 */
export interface ProfileDocument {
  accountId: mongoose.Types.ObjectId;
  name: string;
  instruments: string[];
  genres: string[];
  /** Saisie libre ; chaîne vide si non renseignée. */
  city: string;
  bio: string;
  /** Lien https ou adresse e-mail, visible des membres seulement (A7) ; null si aucun. */
  contact: string | null;
}

const MAX_TAGS = 10;
const atMost = (max: number) => (values: string[]) => values.length <= max;

const profileSchema = new mongoose.Schema<ProfileDocument>(
  {
    // Un compte a exactement un profil (DOMAIN.md).
    accountId: { type: mongoose.Schema.Types.ObjectId, required: true, unique: true },
    name: { type: String, required: true, trim: true, minlength: 1, maxlength: 100 },
    // Les profils créés à l'inscription n'ont que le nom : les valeurs par défaut les complètent.
    instruments: { type: [String], default: [], validate: atMost(MAX_TAGS) },
    genres: { type: [String], default: [], validate: atMost(MAX_TAGS) },
    city: { type: String, default: '', trim: true, maxlength: 100 },
    bio: { type: String, default: '', trim: true, maxlength: 1000 },
    contact: { type: String, default: null, maxlength: 254 },
  },
  { timestamps: true },
);

// Préparation de la recherche (story 11, PERF-2) : instruments, genres, et ville sans tenir
// compte des majuscules ni des accents (ADR 0005).
profileSchema.index({ instruments: 1 });
profileSchema.index({ genres: 1 });
profileSchema.index({ city: 1 }, { collation: { locale: 'fr', strength: 1 } });

export const ProfileModel = mongoose.model<ProfileDocument>('Profile', profileSchema);
