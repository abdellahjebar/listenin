# ListenIn

Réseau professionnel pour musiciens : un **portfolio audio**, des **crédits**, des **contacts**.

Un musicien y présente ce qu'il a joué, et on l'**écoute** avant de l'engager.

> **Statut : socle technique.** Le dépôt contient une application Angular vide et une API qui répond sur `/api/health`, avec la qualité automatisée (lint, tests, CI, images Docker). Les fonctionnalités arrivent par tranches, voir [la feuille de route](#feuille-de-route). Le produit n'est volontairement **pas déployé** pour l'instant.

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
```

- **Monolithe modulaire** : un seul backend déployable, découpé par domaine (identité, profil, portfolio, réseau, recherche). Pas de microservices.
- **Frontend** : composants standalone, Signals, routes chargées par fonctionnalité.
- **Configuration** par variables d'environnement, validée au démarrage ; aucun secret dans le dépôt.
- **Déploiement** : une image Docker par application. La chaîne de livraison viendra plus tard (voir [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)).

Détails et décisions : [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) et [docs/adr/](docs/adr/).

## Prérequis

- **Node.js 24** ou plus récent, avec npm
- **Docker** (facultatif) pour construire les images

## Démarrage rapide

Dans un premier terminal, l'API :

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

Ouvrir <http://localhost:4200>.

## Commandes

Chaque application (`backend/` et `frontend/`) expose les mêmes commandes :

| Commande | Effet |
|---|---|
| `npm run lint` | analyse statique (ESLint) |
| `npm run format` / `npm run format:check` | formate / vérifie le formatage (Prettier) |
| `npm test` | tests (Vitest) |
| `npm run build` | compilation de production |

Spécifiques au backend : `npm run dev` (rechargement automatique), `npm run typecheck`, `npm start` (version compilée).

Images Docker :

```bash
docker build -t listenin-backend backend
docker build -t listenin-frontend frontend
```

## Structure du dépôt

```text
backend/      API Express 5 + TypeScript strict
frontend/     Application Angular 22
docs/         produit, architecture, déploiement, décisions (ADR)
.github/      CI, Dependabot, modèle de pull request
REPORT.md     rapport d'avancement (jalon du cours Technologies Web)
```

## Qualité et intégration continue

À chaque pull request et à chaque push sur `main`, la CI GitHub Actions exécute, pour le backend et le frontend : formatage, lint, types (backend), tests, build, audit des dépendances de production. Elle construit aussi les deux images Docker, **sans les publier**.

Dependabot propose chaque semaine les mises à jour des dépendances npm, des images Docker et des actions GitHub.

## Méthode de travail

- Une **branche par fonctionnalité** et une **pull request**, même en solo.
- **Commits en français**, avec un préfixe (`feat`, `fix`, `chore`, `docs`, `test`, `ci`, `refactor`), un commit par étape.
- Toute route ajoutée ou modifiée met à jour le contrat OpenAPI dans la même pull request (voir l'[ADR 0003](docs/adr/0003-contrat-api-openapi.md)).
- Les **règles d'autorisation** (qui voit ou modifie quoi) sont couvertes par des tests.

## Feuille de route

1. **Socle** (fait) : dépôt, application vide, CI, images Docker.
2. **Documentation produit et architecture** : fonctionnalités, interfaces, modèle de domaine, règles d'accès.
3. **Tranches de valeur** : identité, profil musicien, portfolio public ou privé, page « Découvrir », recherche.
4. **Réseau** : contacts et partage ciblé.
5. **Durcissement et lancement** : sécurité, accessibilité, RGPD.

## Documentation

- [docs/PRODUCT.md](docs/PRODUCT.md) : vision et périmètre
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) : architecture cible et état actuel
- [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) : déploiement (décisions reportées)
- [docs/adr/](docs/adr/) : décisions d'architecture
- [docs/METHODOLOGIE.md](docs/METHODOLOGIE.md) : méthodes de documentation et de décision étudiées
- [REPORT.md](REPORT.md) : rapport d'avancement

## Licence

Code propriétaire, **tous droits réservés**. Aucune licence d'utilisation n'est accordée.
