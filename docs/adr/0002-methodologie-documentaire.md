# Adopter une méthodologie documentaire proportionnée

- Statut : acceptée
- Date : 2026-11-14
- Confiance : élevée
- Réversibilité : facile (il s'agit de documentation, modifiable à tout moment)

## Contexte et problème
ListenIn est un vrai produit, construit par une personne avec l'aide d'un assistant IA. Il faut documenter et décider avec la rigueur d'une grande entreprise, sans produire des documents que personne ne lit. Le catalogue [`../METHODOLOGIE.md`](../METHODOLOGIE.md) compare les méthodes étudiées.

## Options envisagées
* Aucune méthode formelle : documenter au fil de l'eau.
* Méthodes complètes de grande entreprise (arc42 complet, mémos de six pages, toutes les règles d'API de Microsoft).
* Sous-ensemble proportionné, tiré des pratiques de Microsoft, Google et Amazon.

## Décision
Option retenue : « sous-ensemble proportionné », parce qu'il apporte l'essentiel des bénéfices (décisions retrouvables, architecture lisible, exigences testables) pour un coût qu'une personne peut porter.

**Adopté :**
- **Documentation dans le dépôt** (docs as code), mise à jour dans la même pull request que le code.
- **Rangement Diátaxis** : référence, explication, guides pratiques ; un seul type par page.
- **Schémas C4** (niveaux 1 et 2) écrits en **Mermaid** dans les fichiers Markdown.
- **arc42 allégé** comme squelette de `docs/ARCHITECTURE.md`.
- **ADR au format MADR « minimal »**, avec les champs « Confiance » et « Réversibilité ».
- **Études comparatives** pour les choix à plusieurs options, **documents de conception** pour les fonctionnalités non triviales.
- **DDD stratégique léger** : contextes délimités et glossaire.
- **User stories (INVEST)** avec critères d'acceptation **Given/When/Then**, découpées en tranches verticales.
- **ISO/IEC 25010** comme liste de contrôle des exigences non fonctionnelles, sans prétendre à une conformité.
- **Conventions d'API** inspirées de Microsoft et de Google : voir l'ADR 0003.

**Reporté :** revue Well-Architected avant le premier déploiement ; sécurité formelle (cycle de développement sécurisé, modélisation des menaces) au durcissement.

**Écarté :** mémo de six pages, C4 niveau 4, arc42 complet.

**Règles de proportion :**
1. Aucun document sans lecteur ni décision à porter.
2. Deux pages au plus par document.
3. Un document de conception n'est écrit que lorsque la solution n'est pas évidente.
4. Une décision acceptée ne se modifie pas : on la remplace par un nouvel ADR, lié à l'ancien.

L'ADR 0001 reste au format initial (Nygard) : les ADR suivants utilisent le MADR.

### Conséquences
* Bon : les décisions se retrouvent avec leurs alternatives écartées.
* Bon : des documents courts, relus comme du code.
* Bon : des exigences directement testables.
* Mauvais : un peu plus d'écriture à chaque décision.
* Mauvais : il faut la discipline de tenir les règles de proportion.
