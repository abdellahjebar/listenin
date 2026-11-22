# Déploiement

## Statut
**Non déployé, volontairement.** Le produit sera déployé plus tard ; il est construit pour que ce soit simple.

## Ce qui est déjà prêt
- Une **image Docker** par application (`backend/Dockerfile`, `frontend/Dockerfile`), construites par la CI **sans publication**.
- Une **configuration par variables d'environnement**, validée au démarrage (`backend/src/config.ts`, modèle dans `backend/.env.example`).
- Un **point de santé** : `GET /api/health`, utilisé par le `HEALTHCHECK` de l'image.
- Une API qui **refuse de démarrer** sans base joignable (`MONGODB_URI`, obligatoire et jamais journalisée).
- Un **arrêt propre** à la réception de `SIGTERM` : requêtes en cours terminées, puis connexion à la base fermée.
- Un frontend servi par **nginx sans privilèges**, avec repli vers `index.html` pour le routeur Angular.

## Décisions reportées
| Sujet | À décider quand |
|---|---|
| Hébergeur et budget | avant le premier déploiement |
| Hébergement de MongoDB (service géré ou conteneur avec volume persistant) et sauvegardes | avant le premier déploiement |
| Reverse proxy qui sert l'application et l'API sous la même origine (principe fixé dans [ARCHITECTURE.md](ARCHITECTURE.md)) | avant le premier déploiement |
| Chaîne de livraison continue | après le premier déploiement manuel |

## Hors périmètre aujourd'hui
Aucun environnement, aucun nom de domaine, aucun service tiers connecté.
