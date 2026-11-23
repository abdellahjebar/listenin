import { mongoose } from '../../database.js';

export interface Session {
  /** SHA-256 du numéro de session : une fuite de la base ne livre aucune session utilisable. */
  tokenHash: string;
  accountId: mongoose.Types.ObjectId;
  createdAt: Date;
  lastSeenAt: Date;
  /** La plus proche des deux limites : 7 jours sans activité, 30 jours au total (ADR 0006). */
  expiresAt: Date;
}

const sessionSchema = new mongoose.Schema<Session>({
  tokenHash: { type: String, required: true, unique: true },
  // Index : retrouver les sessions d'un membre, pour les fermer toutes (changement de mot de passe).
  accountId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
  createdAt: { type: Date, required: true },
  lastSeenAt: { type: Date, required: true },
  // MongoDB supprime lui-même une session dès sa date d'expiration passée.
  expiresAt: { type: Date, required: true, expires: 0 },
});

export const SessionModel = mongoose.model<Session>('Session', sessionSchema);
