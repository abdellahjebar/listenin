# Gérer le travail avec des issues, un projet et des pull requests

- Statut : acceptée
- Date : 2026-11-14
- Confiance : élevée
- Réversibilité : facile (de l'organisation du travail, modifiable à tout moment)

## Contexte et problème
ListenIn avance par petites tranches, seul et avec un assistant IA. Il faut savoir **pourquoi** chaque changement existe, **où** en est le travail, et pouvoir le reprendre sans mémoire. Un dépôt privé sur un compte GitHub gratuit **n'impose pas** techniquement les règles de protection de branche : la discipline doit donc venir du flux de travail.

## Options envisagées
* Aucun suivi formel : des commits directement sur `main`.
* Issues, projet GitHub et pull requests.
* Un outil externe de gestion de projet (Jira, Linear, etc.).

## Décision
Option retenue : « issues, projet GitHub et pull requests », parce que tout reste au même endroit que le code (une pull request peut fermer une issue) et sans outil supplémentaire à payer ni à connecter.

**Le flux :**
1. Une **issue** pour chaque travail, créée avec l'un des trois formulaires : user story, tâche technique, décision. Les étiquettes disent le type (`type:`), la zone (`zone:`) et la priorité (`prio:`) ; le **jalon** dit le palier.
2. Le **projet GitHub** « ListenIn » suit l'avancement en cinq colonnes : *À faire*, *Prêt*, *En cours*, *En revue*, *Terminé*.
3. Une **branche** `type/N-titre-court` par issue (par exemple `feat/14-profil-musicien`).
4. Une **pull request** dont la description contient `Closes #N`, avec le code, les tests, le contrat OpenAPI et la documentation.
5. ~~**Fusion en squash** une fois la CI verte.~~ **Remplacé par l'[ADR 0009](0009-versionnage-et-publication.md)** : fusion par merge commit, chaque commit et le titre de la PR au format Conventional Commits, vérifiés en CI.
6. **Aucun push direct sur `main`**, y compris pour la documentation.

Les pull requests de Dependabot gardent leur format et sont fusionnées de la même façon.

**Reporté :** backlog complet, vue « feuille de route », champs supplémentaires du projet, `CODEOWNERS`. La publication automatique des versions est traitée par l'ADR 0009.

### Conséquences
* Bon : chaque changement remonte à une issue, chaque décision à un ADR.
* Bon : l'état du travail se voit d'un coup d'œil.
* Mauvais : un peu de cérémonie, même pour un petit changement.
* Mauvais : rien n'empêche techniquement un push direct sur `main` ; seule la discipline le garantit. Une offre GitHub payante, ou un dépôt public, permettrait de l'imposer.
