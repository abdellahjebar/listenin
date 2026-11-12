# Rapport d'avancement

> Jalon du cours Technologies Web (TP4, début du mini-projet). Ce document est mis à jour à chaque étape importante : travail effectué, choix techniques, fonctionnalités, résultats des tests.

## 1. Contexte
ListenIn est un réseau professionnel pour musiciens : portfolio audio, crédits, contacts. Le sujet du cours propose de partir d'un prototype (gestion d'utilisateurs, fichiers, formulaires) et laisse libre l'orientation du projet. Ce projet est conçu comme un vrai logiciel, dont le jalon du cours est une étape.

## 2. Travail effectué
Socle technique :
- dépôt Git privé, conventions de commit, modèle de pull request ;
- application Angular 22 avec ESLint et Prettier ;
- API Express 5 en TypeScript strict : configuration validée, journaux structurés, route de santé, en-têtes de sécurité ;
- images Docker du backend et du frontend ;
- intégration continue (formatage, lint, types, tests, build, audit, construction des images).

## 3. Choix techniques
Voir [docs/adr/](docs/adr/) et [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md). En bref : monolithe modulaire, TypeScript strict des deux côtés, Vitest, Docker.

## 4. Fonctionnalités implémentées
Aucune fonctionnalité métier pour l'instant : la prochaine étape est la documentation produit, puis les tranches (profil, portfolio, découverte, recherche).

## 5. Résultats des tests
| Zone | Résultat |
|---|---|
| Backend | 7 tests réussis (route de santé, en-têtes de sécurité, route inconnue, validation de la configuration) |
| Frontend | 2 tests réussis (application par défaut) |
| Lint, formatage, types, build, audit | réussis, y compris depuis un clone propre du dépôt |
| Images Docker | à valider par la CI (le moteur Docker local n'était pas démarré) |

## 6. Utilisation d'un assistant IA
Le projet est mené avec un assistant IA selon la méthode « plan d'abord, validation avant modification, une étape par commit » décrite dans [AGENTS.md](AGENTS.md).
