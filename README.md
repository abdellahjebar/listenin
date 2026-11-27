# ListenIn

Réseau professionnel pour musiciens : un **portfolio audio**, des **crédits**, des **contacts**.

Un musicien y présente ce qu'il a joué, et on l'**écoute** avant de l'engager.

> **Statut : tranche « identité » en cours.** L'API permet de s'inscrire, de se connecter et de se déconnecter (`/api/accounts`, `/api/sessions`) ; l'application propose l'inscription et la connexion (`/inscription`, `/connexion`). La qualité est automatisée (lint, tests, contrat OpenAPI, CI, images Docker). Les fonctionnalités arrivent par tranches, voir [la feuille de route](#feuille-de-route). Le produit n'est volontairement **pas déployé** pour l'instant.

## Sommaire

1. [Architecture](#architecture)
2. [Prérequis](#prérequis)
3. [Démarrage rapide](#démarrage-rapide)
4. [Commandes](#commandes)
5. [Structure du dépôt](#structure-du-dépôt)
6. [Qualité et intégration continue](#qualité-et-intégration-continue)
7. [Méthode de travail](#méthode-de-travail)
8. [Feuille de route](#feuille-de-route)
9. [Documentation](#documentation)
10. [Licence](#licence)

## Architecture

```text
Navigateur ──► Frontend (Angular 22) ──► API (Express 5, TypeScript) ──► MongoDB
                                                    (données + fichiers audio dans GridFS)
```

- **Monolithe modulaire** : un seul backend déployable, découpé par domaine (identité, profil, portfolio, découverte et recherche, confiance). Pas de microservices.
- **Frontend** : composants standalone, Signals, routes chargées par fonctionnalité ; interface avec Spartan et Tailwind v4, thème clair et sombre selon le système (voir l'[ADR 0010](docs/adr/0010-base-interface-spartan.md)).
- **Configuration** par variables d'environnement, validée au démarrage ; aucun secret dans le dépôt.
- **Données** : MongoDB, fichiers audio compris (GridFS), voir l'[ADR 0005](docs/adr/0005-base-de-donnees-mongodb.md) ; accès avec Mongoose, voir l'[ADR 0008](docs/adr/0008-acces-mongodb-mongoose.md).
- **Déploiement** : une image Docker par application. La chaîne de livraison viendra plus tard (voir [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)).

Schémas C4 et décisions : [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) et [docs/adr/](docs/adr/).

## Prérequis

- **Node.js 24** ou plus récent, avec npm
- **MongoDB 8** pour lancer l'API, le plus simple étant **Docker** (aussi utilisé pour construire les images). Les tests n'en ont pas besoin : ils démarrent leur propre base en mémoire.

## Démarrage rapide

**Tout lancer avec Docker** (le plus simple) :

```bash
docker compose up --build
```

Ouvrir <http://localhost:8080> (utiliser `localhost`, pas `127.0.0.1`). MongoDB, l'API et l'application démarrent dans cet ordre ; les données sont gardées dans un volume Docker entre deux lancements (`docker compose down --volumes` les efface).

**Pour développer** (rechargement automatique), sans Docker pour l'application : une base MongoDB locale, une seule fois :

```bash
docker run -d --name listenin-mongo -p 27017:27017 mongo:8
```

Les fois suivantes : `docker start listenin-mongo`.

Dans un premier terminal, l'API (elle refuse de démarrer si la base est injoignable) :

```bash
cd backend
cp .env.example .env
npm ci
npm run dev
```

Vérifier : <http://localhost:3000/api/health> répond `{"status":"ok"}`.

Dans un second terminal, le frontend :

```bash
cd frontend
npm ci
npm start
```

Ouvrir <http://localhost:4200> ; l'inscription est sur <http://localhost:4200/inscription>, la connexion sur <http://localhost:4200/connexion>. Le serveur de développement renvoie `/api` vers l'API (`frontend/proxy.conf.json`) : l'application et l'API partagent la même origine, comme en production, et `APP_ORIGIN` vaut `http://localhost:4200`.

## Commandes

Chaque application (`backend/` et `frontend/`) expose les mêmes commandes :

| Commande | Effet |
|---|---|
| `npm run lint` | analyse statique (ESLint) |
| `npm run format` / `npm run format:check` | formate / vérifie le formatage (Prettier) |
| `npm test` | tests (Vitest) |
| `npm run build` | compilation de production |

Spécifiques au backend : `npm run dev` (rechargement automatique), `npm run typecheck`, `npm start` (version compilée). Le premier `npm test` du backend télécharge le binaire MongoDB des tests (environ 100 Mo), puis le réutilise.

Spécifique au frontend : `npx ng g @spartan-ng/cli:ui <composant>` ajoute un composant Spartan dans `libs/ui`.

Contrat d'API ([`backend/openapi.yaml`](backend/openapi.yaml), écrit avant le code, voir l'[ADR 0007](docs/adr/0007-outillage-openapi.md)) :

| Commande | Dossier | Effet |
|---|---|---|
| `npm run api:lint` | `backend/` | vérifie le contrat (Redocly, règles strictes) |
| `npm run api:docs` | `backend/` | génère la documentation dans `dist/api-docs.html`, à ouvrir en local |
| `npm run api:types` | `backend/` et `frontend/` | régénère les types TypeScript de l'API, à commiter avec le contrat |

Docker : `docker compose up --build` lance tout (voir [Démarrage rapide](#démarrage-rapide)) ; `docker compose logs -f api` suit les journaux de l'API ; `docker compose down` arrête.

## Structure du dépôt

```text
backend/      API Express 5 + TypeScript strict
frontend/     Application Angular 22 (composants Spartan copiés dans frontend/libs/ui)
docs/         produit, architecture, déploiement, décisions (ADR)
.github/      CI, Dependabot, modèle de pull request
REPORT.md     rapport d'avancement (jalon du cours Technologies Web)
```

## Qualité et intégration continue

À chaque pull request et à chaque push sur `main`, la CI GitHub Actions exécute, pour le backend et le frontend : formatage, lint, types (backend), tests, build, audit des dépendances de production. Elle vérifie aussi le contrat OpenAPI, la conformité des réponses de l'API au contrat (dans les tests) et que les types de l'API du frontend sont à jour. Enfin, elle construit les deux images Docker, **sans les publier**, et les **lance avec `docker compose`** pour vérifier la santé, l'inscription et la connexion de bout en bout. Un second contrôle vérifie le format du titre et de chaque commit de la pull request. Les actions utilisées sont figées par empreinte SHA.

Dependabot propose chaque semaine les mises à jour des dépendances npm, des images Docker et des actions GitHub.

## Méthode de travail

- Une **issue** par travail (trois formulaires : user story, tâche technique, décision), suivie dans le projet GitHub du dépôt.
- Une **branche** courte `type/N-titre-court` et une **pull request** « Closes #N » par issue, même en solo ; **pas de push direct sur `main`** (voir l'[ADR 0004](docs/adr/0004-gestion-du-travail.md)).
- **Fusion par merge commit** : tout l'historique est gardé ; `git log --first-parent main` donne une ligne par pull request (voir l'[ADR 0009](docs/adr/0009-versionnage-et-publication.md)).
- **Commits en français au format Conventional Commits** (`type(zone): résumé`, types `feat`, `fix`, `perf`, `refactor`, `docs`, `test`, `ci`, `build`, `chore`, `revert`), un commit propre par étape. La CI vérifie le titre de la pull request et chaque commit ; en local : `BASE_SHA=origin/main HEAD_SHA=HEAD scripts/check-conventional-commits.sh`.
- **Versions SemVer** publiées par release-please : il tient à jour une pull request de version (`CHANGELOG.md`) ; la fusionner crée le tag `vX.Y.Z` et la GitHub Release.
- Toute route ajoutée ou modifiée met à jour le contrat OpenAPI dans la même pull request (voir les ADR [0003](docs/adr/0003-contrat-api-openapi.md) et [0007](docs/adr/0007-outillage-openapi.md)).
- Les **règles d'autorisation** (qui voit ou modifie quoi) sont couvertes par des tests.

## Feuille de route

1. **Socle** (fait) : dépôt, application vide, CI, images Docker.
2. **Documentation produit et architecture** : fonctionnalités, interfaces, modèle de domaine, règles d'accès.
3. **Tranches de valeur** : identité, profil musicien, portfolio public ou privé, page « Découvrir », recherche.
4. **Réseau** : contacts et partage ciblé.
5. **Durcissement et lancement** : sécurité, accessibilité, RGPD.

## Documentation

- [docs/PRODUCT.md](docs/PRODUCT.md) : vision et périmètre du palier 1
- [docs/USER-STORIES.md](docs/USER-STORIES.md) : user stories et critères d'acceptation
- [docs/DOMAIN.md](docs/DOMAIN.md) : domaines, glossaire et invariants
- [docs/AUTHORIZATION.md](docs/AUTHORIZATION.md) : matrice d'autorisation
- [docs/QUALITY.md](docs/QUALITY.md) : exigences de qualité (sécurité, performance, accessibilité…)
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) : schémas C4 (contexte, conteneurs) et état actuel
- [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) : déploiement (décisions reportées)
- [docs/adr/](docs/adr/) : décisions d'architecture
- [docs/METHODOLOGIE.md](docs/METHODOLOGIE.md) : méthodes de documentation et de décision étudiées
- [REPORT.md](REPORT.md) : rapport d'avancement

## Licence

Code propriétaire, **tous droits réservés**. Aucune licence d'utilisation n'est accordée.
