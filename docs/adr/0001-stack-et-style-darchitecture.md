# ADR 0001 : stack et style d'architecture

- Statut : acceptée
- Date : 2026-11-12

## Contexte
ListenIn est un vrai produit, construit par une personne avec l'aide d'un assistant IA, destiné à être déployé plus tard. Il faut une base solide et proportionnée : assez de rigueur pour grandir, sans complexité inutile.

## Décision
- **Frontend** : Angular 22, composants standalone, Signals, TypeScript strict.
- **Backend** : Express 5, **TypeScript strict**, ESM.
- **Style** : **monolithe modulaire**, découpé par domaine, un seul backend déployable.
- **Tests** : Vitest des deux côtés, `supertest` pour l'API.
- **Qualité** : ESLint et Prettier, CI à chaque pull request, audit des dépendances de production.
- **Livraison** : une image Docker par application ; aucun déploiement pour l'instant.
- **Gestionnaire de paquets** : npm, deux paquets indépendants, sans outil de monorepo.
- **Dépôt** : privé, code propriétaire.

## Conséquences
- Un seul langage typé de bout en bout ; pas de types partagés entre frontend et backend : le contrat d'API documenté en tient lieu, pour éviter un outillage de monorepo.
- Un seul déploiement côté API, donc des déploiements et des tests simples ; le découpage par domaine garde une sortie possible vers des services séparés si un besoin réel apparaît.
- La base de données n'est pas encore choisie par ADR : MongoDB est envisagé et sera confirmé à la première tranche qui en a besoin.
