# AGENTS.md : règles pour les assistants IA

À lire en début de session, à mettre à jour quand les règles changent. Le projet est décrit dans [README.md](README.md).

## Méthode de travail
- **Plan d'abord** : analyser, proposer un plan, **attendre la validation** avant de modifier quoi que ce soit.
- **Petites étapes** : un commit par étape, fichiers et message confirmés avant de commiter.
- **Rien n'est poussé, publié ni déployé sans accord explicite.**
- Expliquer les choix, signaler les erreurs sans les masquer, et dire clairement ce qui n'a pas pu être vérifié.
- Vérifier avant d'affirmer : lint, types, tests, build, et une exécution réelle quand c'est possible.

## Règles du dépôt
- Contenu du dépôt (documents, commentaires utiles) et messages de commit **en français**, avec préfixe (`feat`, `fix`, `chore`, `docs`, `test`, `ci`, `refactor`).
- **Aucune ligne « Co-Authored-By »** dans les commits ni les pull requests.
- **Aucun secret** (URI de base, clé de signature, mot de passe, jeton, `.env`) dans le code, Git, les journaux, les captures ou les prompts. Seul `.env.example` est versionné.
- Aucun `catch` vide : journaliser l'erreur et répondre explicitement.
- Toute route ajoutée ou modifiée met à jour le contrat d'API dans la même pull request.
- Toute règle d'accès (qui voit ou modifie quoi) a des tests, y compris les refus.
- Toute décision d'architecture notable est consignée dans `docs/adr/`.
- Pas de sur-ingénierie : une complexité n'entre que si elle répond à un besoin présent (voir la liste « pas maintenant » dans [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)).

## Backend (`backend/`)
- TypeScript strict, ESM, imports relatifs avec l'extension `.js`.
- Configuration lue et validée par `src/config.ts` ; jamais de `process.env` ailleurs.
- Entrées du navigateur jamais crues : validation à la frontière HTTP, aucune requête construite à partir d'une entrée non validée.
- Journaux structurés (pino), sans mot de passe ni jeton.
- Tests : Vitest, avec `supertest` pour l'API.

## Frontend (`frontend/`)
- Composants standalone, Signals, `inject()`, `@if` / `@for`, typage strict, pas de `any`.
- Un composant n'appelle jamais `HttpClient` : il passe par un service.
- Accessibilité WCAG AA.
- Tests : Vitest, avec `HttpTestingController` pour le HTTP (aucun backend requis).

## Après une modification
Lancer, dans chaque dossier modifié : `npm run lint`, `npm test`, `npm run build` (et `npm run typecheck` côté backend), puis expliquer les résultats.

## Journal des étapes
| Étape | Statut | Traces |
|---|---|---|
| Dépôt, application Angular, lint et format | fait | `chore: initialisation`, `chore(frontend)` |
| Squelette backend Express TypeScript | fait | `chore(backend)` |
| Images Docker (construites par la CI, non testées en local) | fait | `chore: images Docker` |
| CI, Dependabot, modèle de pull request | fait | `ci:` |
| Documentation de départ | fait | `docs:` |
