# Décisions d'architecture (ADR)

Une décision notable, une page. Les ADR forment un **journal en ajout seulement** : une décision acceptée ne se modifie pas, on la **remplace** par un nouvel ADR lié à l'ancien, et on met à jour le statut de l'ancien. La méthode est décrite dans l'[ADR 0002](0002-methodologie-documentaire.md).

| N° | Titre | Statut |
|---|---|---|
| [0001](0001-stack-et-style-darchitecture.md) | Stack et style d'architecture | Acceptée (format initial) |
| [0002](0002-methodologie-documentaire.md) | Méthodologie documentaire | Acceptée |
| [0003](0003-contrat-api-openapi.md) | Contrat d'API avec OpenAPI | Acceptée |
| [0004](0004-gestion-du-travail.md) | Gestion du travail : issues, projet, pull requests | Acceptée |

## Modèle (MADR « minimal »)

Le fichier se nomme `NNNN-titre-en-minuscules.md`. Un choix à plusieurs options commence par une **étude comparative** (critères, options, comparaison) ; l'ADR en garde la conclusion.

```markdown
# Titre court : le problème et la solution

- Statut : proposée | acceptée | remplacée par NNNN
- Date : AAAA-MM-JJ
- Confiance : faible | moyenne | élevée
- Réversibilité : facile | modérée | coûteuse

## Contexte et problème
Pourquoi cette décision est nécessaire.

## Options envisagées
* Option A
* Option B

## Décision
Option retenue : « … », parce que …

### Conséquences
* Bon : …
* Mauvais : …
```
