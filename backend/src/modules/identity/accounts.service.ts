import type { Logger } from 'pino';
import { mongoose } from '../../database.js';
import { ApiError } from '../../middleware/errors.js';
import { createProfile } from '../profile/index.js';
import { AccountModel, CURRENT_TERMS_VERSION } from './account.model.js';
import { hashPassword } from './password.js';
import { createSession } from './sessions.js';

export interface Registration {
  name: string;
  email: string;
  password: string;
}

export interface RegisteredAccount {
  id: string;
  name: string;
  email: string;
  sessionToken: string;
}

const DUPLICATE_KEY = 11000;

function isDuplicateKey(error: unknown): boolean {
  return error instanceof mongoose.mongo.MongoServerError && error.code === DUPLICATE_KEY;
}

/**
 * Inscription (story 1) : compte, puis profil, puis session.
 * Le compte et le profil appartiennent à deux modules, donc à deux documents : sans transaction
 * (ADR 0005), un échec du profil est compensé en supprimant le compte qui vient d'être créé.
 */
export async function registerAccount(
  registration: Registration,
  logger: Logger,
): Promise<RegisteredAccount> {
  const passwordHash = await hashPassword(registration.password);

  let account;
  try {
    account = await AccountModel.create({
      email: registration.email,
      passwordHash,
      termsAcceptance: { version: CURRENT_TERMS_VERSION, acceptedAt: new Date() },
    });
  } catch (error) {
    // L'index unique tranche : deux inscriptions simultanées ne peuvent pas passer toutes deux.
    if (isDuplicateKey(error)) {
      throw new ApiError(409, 'EmailAlreadyUsed', 'Cette adresse e-mail est déjà utilisée');
    }
    throw error;
  }

  const name = registration.name.trim();
  try {
    await createProfile(account._id, name);
  } catch (error) {
    await AccountModel.deleteOne({ _id: account._id }).catch((cleanupError: unknown) => {
      logger.error(
        { err: cleanupError, accountId: account._id.toString() },
        'Compte sans profil : suppression de compensation impossible',
      );
    });
    throw error;
  }

  const sessionToken = await createSession(account._id);
  return { id: account._id.toString(), name, email: account.email, sessionToken };
}
