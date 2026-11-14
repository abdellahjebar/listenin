# Décrire le contrat d'API avec OpenAPI

- Statut : acceptée
- Date : 2026-11-14
- Confiance : moyenne (OpenAPI n'a pas encore été étudié en détail : les outils restent à choisir)
- Réversibilité : modérée (le contrat peut être réécrit en Markdown, mais les types du frontend en dépendront)

## Contexte et problème
Le frontend Angular et l'API évoluent ensemble dans le même dépôt. Comment décrire le contrat HTTP pour qu'il serve à la fois de documentation, de source des types du frontend et de contrôle d'écart avec le serveur ?

## Options envisagées
* Contrat en Markdown, comme dans les TP du cours.
* OpenAPI dès la première route.
* Markdown d'abord, OpenAPI plus tard.

## Décision
Option retenue : « OpenAPI dès la première route », parce que le contrat devient exploitable par des outils (génération des types, documentation interactive, détection d'un écart entre contrat et code) et qu'il coûte moins cher à adopter au début qu'après coup.

**Principe :** le fichier `openapi.yaml` est la **source de vérité**, écrit **avant** le code de la route (le contrat d'abord).

**Conventions :**
- une URL par ressource, avec des noms (pas de verbes) ;
- méthodes standard d'abord (lire, lister, créer, modifier, supprimer), méthodes personnalisées seulement quand elles ne suffisent pas (Google AIP) ;
- un **format d'erreur constant** pour tout le contrat (Microsoft REST API Guidelines) ;
- la pagination décrite dans le contrat ;
- la politique de versionnage est à décider avant le premier déploiement.

**À trancher par une courte étude, avant la première route :** l'outil de validation des requêtes, la génération des types TypeScript pour Angular, la page de documentation, et le contrôle du contrat en intégration continue. Chaque choix important aura son ADR.

### Conséquences
* Bon : un contrat unique et vérifiable ; les types du frontend en sont dérivés ; un écart avec le code peut être détecté en CI.
* Bon : une documentation interactive sans l'écrire à la main.
* Mauvais : un fichier plus verbeux qu'un tableau Markdown, et un outillage à apprendre.
* Mauvais : risque de dupliquer le contrat et la validation des requêtes si on ne choisit pas une source unique : à trancher dans l'étude.
