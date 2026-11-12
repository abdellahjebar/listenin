# Déploiement

## Statut
**Non déployé, volontairement.** Le produit sera déployé plus tard ; il est construit pour que ce soit simple.

## Ce qui est déjà prêt
- Une **image Docker** par application (`backend/Dockerfile`, `frontend/Dockerfile`), construites par la CI **sans publication**.
- Une **configuration par variables d'environnement**, validée au démarrage (`backend/src/config.ts`, modèle dans `backend/.env.example`).
- Un **point de santé** : `GET /api/health`, utilisé par le `HEALTHCHECK` de l'image.
- Un **arrêt propre** à la réception de `SIGTERM`.
- Un frontend servi par **nginx sans privilèges**, avec repli vers `index.html` pour le routeur Angular.

## Décisions reportées
| Sujet | À décider quand |
|---|---|
| Hébergeur et budget | avant le premier déploiement |
| Stockage des fichiers audio : un **stockage objet** est prévu, car le disque d'un conteneur est éphémère | avant la tranche « portfolio » |
| Session : jeton d'accès court et jeton de rafraîchissement en cookie `httpOnly` | avant la tranche « identité » |
| Appel de l'API depuis le frontend en production (même origine derrière un reverse proxy, ou CORS) | avant le premier déploiement |
| Chaîne de livraison continue | après le premier déploiement manuel |

## Hors périmètre aujourd'hui
Aucun environnement, aucun nom de domaine, aucun service tiers connecté.
