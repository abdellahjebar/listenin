import type { Logger } from 'pino';
import type { mongoose } from '../../database.js';
import { ApiError } from '../../middleware/errors.js';
import { findProfileName } from '../profile/index.js';
import { AccountModel } from './account.model.js';
import { hashPassword, verifyPassword } from './password.js';
import { createSession, deleteSession } from './sessions.js';

export interface MemberView {
  id: string;
  name: string;
  email: string;
}

/** Une seule erreur pour une adresse inconnue et un mauvais mot de passe (F4). */
const invalidCredentials = () =>
  new ApiError(401, 'InvalidCredentials', 'Adresse e-mail ou mot de passe incorrect');

/**
 * Empreinte factice, vérifiée quand l'adresse est inconnue : la réponse prend alors le même temps
 * qu'avec un mauvais mot de passe, et sa durée ne révèle pas si un compte existe.
 */
let dummyHash: Promise<string> | undefined;
const getDummyHash = () => (dummyHash ??= hashPassword('mot de passe factice jamais utilisé'));

/**
 * Connexion (story 2) : vérifie les identifiants, supprime la session que le navigateur avait
 * peut-être déjà, puis en ouvre une nouvelle, avec un nouveau numéro (contre la fixation).
 */
export async function logIn(
  credentials: { email: string; password: string },
  previousToken: string | undefined,
  logger: Logger,
): Promise<{ member: MemberView; sessionToken: string }> {
  const account = await AccountModel.findOne({ email: credentials.email.trim().toLowerCase() });

  if (!account) {
    await verifyPassword(credentials.password, await getDummyHash());
    throw invalidCredentials();
  }
  if (!(await verifyPassword(credentials.password, account.passwordHash))) {
    throw invalidCredentials();
  }

  if (previousToken) {
    await deleteSession(previousToken);
  }
  const sessionToken = await createSession(account._id);
  const member = await describeMember(account._id, logger);
  return { member, sessionToken };
}

/** Le membre tel que l'application web le voit : identifiant, nom, adresse. */
export async function describeMember(
  accountId: mongoose.Types.ObjectId,
  logger: Logger,
): Promise<MemberView> {
  const account = await AccountModel.findById(accountId, { email: 1 }).lean();
  if (!account) {
    throw new Error('Session rattachée à un compte inexistant');
  }
  const name = await findProfileName(accountId);
  if (name === null) {
    // Possible si le serveur s'est arrêté entre la création du compte et celle du profil.
    // La story 3 recréera le profil ; en attendant, le membre reste utilisable.
    logger.warn({ accountId: accountId.toString() }, 'Compte sans profil');
  }
  return { id: accountId.toString(), name: name ?? '', email: account.email };
}

export async function logOut(token: string | undefined): Promise<void> {
  if (token) {
    await deleteSession(token);
  }
}
