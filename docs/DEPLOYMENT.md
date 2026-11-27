# Déploiement

## Statut
**Non déployé, volontairement.** Le produit sera déployé plus tard ; il est construit pour que ce soit simple.

## Ce qui est déjà prêt
- Une **image Docker** par application (`backend/Dockerfile`, `frontend/Dockerfile`), construites par la CI **sans publication**.
- Une **configuration par variables d'environnement**, validée au démarrage (`backend/src/config.ts`, modèle dans `backend/.env.example`).
- Un **point de santé** : `GET /api/health`, utilisé par le `HEALTHCHECK` de l'image.
- Une API qui **refuse de démarrer** sans base joignable (`MONGODB_URI`, obligatoire et jamais journalisée).
- Un **arrêt propre** à la réception de `SIGTERM` : requêtes en cours terminées, puis connexion à la base fermée.
- Un frontend servi par **nginx sans privilèges**, avec repli vers `index.html` pour le routeur Angular, qui **relaie `/api`** vers l'API sous la même origine (adresse fixée par `API_UPSTREAM`).
- **`compose.yaml`** : la pile complète (MongoDB avec volume, API, nginx), lancée et testée par la CI. C'est la base d'un déploiement sur un serveur unique.
- **`TRUST_PROXY`** : nombre de proxys de confiance devant l'API (1 derrière nginx), pour que les limites de tentatives comptent les vraies adresses IP.

## À faire avant tout déploiement réel
- **HTTPS** obligatoire (le cookie de session est `Secure`) et `APP_ORIGIN` égal à l'adresse publique.
- **MongoDB authentifié** : la base locale de `compose.yaml` n'a pas de mot de passe parce que son port n'est pas exposé ; en production, un utilisateur dédié et un mot de passe en secret.
- `TRUST_PROXY` égal au nombre réel de proxys (hébergeur + nginx), sinon les limites de tentatives peuvent être contournées ou partagées.

## Décisions reportées
| Sujet | À décider quand |
|---|---|
| Hébergeur et budget | avant le premier déploiement |
| Hébergement de MongoDB (service géré ou conteneur avec volume persistant) et sauvegardes | avant le premier déploiement |
| Chaîne de livraison continue | après le premier déploiement manuel |

## Hors périmètre aujourd'hui
Aucun environnement, aucun nom de domaine, aucun service tiers connecté.
