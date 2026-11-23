// Interface publique du module Identité : les autres modules n'importent que ce fichier (MAI-3).
export { createAccountsRouter } from './accounts.router.js';
export { currentMember, requireSession } from './require-session.js';
export { createSessionsRouter } from './sessions.router.js';
