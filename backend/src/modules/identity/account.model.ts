import { mongoose } from '../../database.js';

/** Version du texte des conditions d'utilisation, tant que le texte définitif n'existe pas. */
export const CURRENT_TERMS_VERSION = '0-brouillon';

export interface Account {
  /** Toujours en minuscules : `Ada@x.fr` et `ada@x.fr` sont le même compte. */
  email: string;
  /** Empreinte Argon2id au format PHC ; jamais le mot de passe (SEC-1). */
  passwordHash: string;
  /**
   * Enregistrée dans le compte, et non à part : la règle « aucun compte sans acceptation »
   * tient ainsi dans un seul document (invariant 7, ADR 0005).
   */
  termsAcceptance: { version: string; acceptedAt: Date };
}

const accountSchema = new mongoose.Schema<Account>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    termsAcceptance: {
      type: new mongoose.Schema(
        {
          version: { type: String, required: true },
          acceptedAt: { type: Date, required: true },
        },
        { _id: false },
      ),
      required: true,
    },
  },
  { timestamps: true },
);

export const AccountModel = mongoose.model<Account>('Account', accountSchema);
