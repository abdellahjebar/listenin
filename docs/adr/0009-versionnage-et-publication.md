# ADR 0009 : versionnage et publication

- Statut : acceptée
- Date : 2026-11-27
- Confiance : élevée
- Réversibilité : facile pour les outils, impossible pour l'historique déjà fusionné (c'est voulu)
- Complète : [ADR 0004](0004-gestion-du-travail.md), dont il remplace le point 5 (fusion en squash)

## Contexte et problème

Le dépôt n'a publié aucune version (un seul tag, `v0.0.0`), n'a pas de journal des changements, et chaque pull request était fusionnée en squash : les commits intermédiaires disparaissaient de `main`. Le porteur du projet veut **garder tout l'historique** et un versionnage de niveau entreprise. Les pratiques de référence : petites branches de courte durée sur un tronc toujours prêt (DORA), messages Conventional Commits, versions SemVer, branche principale protégée, chaîne d'intégration durcie (OpenSSF Scorecard).

## Options envisagées

**Méthode de fusion**
* **A. Squash** : un commit par PR sur `main`, les commits de la branche ne restent que sur la page de la PR
* **B. Rebase** : tous les commits gardés en ligne droite, mais recopiés (nouvelles empreintes) et sans lien avec leur PR
* **C. Merge commit** : tous les commits gardés tels quels, plus un commit de fusion qui regroupe la PR

**Publication des versions**
* **semantic-release** : publie seul à chaque fusion, sans étape de validation
* **Changesets** : une fiche à écrire par PR, pensé pour plusieurs paquets npm publiés
* **release-please** (Google) : lit les commits et tient à jour une « PR de version » ; la fusionner publie

## Décision

**Fusion : C, merge commit uniquement** (squash et rebase désactivés dans les réglages du dépôt), parce que c'est la seule méthode qui conserve chaque commit, son auteur, sa date et son empreinte d'origine, tout en gardant le regroupement par PR. La vue résumée reste disponible : `git log --first-parent main` affiche une ligne par PR. Le commit de fusion garde le titre standard de GitHub (« Merge pull request #N … ») et porte le titre de la PR dans son corps : ainsi, il n'apparaît pas une seconde fois dans le journal des changements.

**Messages : Conventional Commits, vérifiés en CI** (`.github/workflows/conventions.yml`, `scripts/check-conventional-commits.sh`). Le titre de chaque PR et chacun de ses commits doivent suivre `type(zone): résumé` ; types admis : `feat`, `fix`, `perf`, `refactor`, `docs`, `test`, `ci`, `build`, `chore`, `revert` ; `!` avant `:` signale un changement cassant. Chaque commit entrant dans l'histoire officielle, aucun commit « wip » ou « fix typo » : un commit par étape, propre et en français.

**Versions : SemVer avec release-please** (`.github/workflows/release.yml`, `release-please-config.json`, `.release-please-manifest.json`).
- Une seule version pour le produit (`version.txt`, reportée dans `backend/package.json` et `frontend/package.json`).
- `feat` augmente la version mineure, `fix` le correctif ; tant que la version est en `0.x`, un changement cassant augmente la mineure. `1.0.0` marquera le premier lancement.
- release-please ouvre une PR « chore(main): release X.Y.Z » avec `CHANGELOG.md` (sections en français). **La fusionner** crée le tag `vX.Y.Z` et la GitHub Release : rien n'est publié sans cette décision.
- Première version : `v0.1.0` (socle, documentation, tranche « identité » de l'API).

**Version du contrat d'API** (`info.version` de `backend/openapi.yaml`), tenue à part, à la main, dans la PR qui change le contrat :
- **majeure** : retirer ou renommer une route ou un champ, ajouter un champ obligatoire, changer un type ou un comportement attendu, accompagnée d'un ADR ;
- **mineure** : ajouter une route ou un champ facultatif ;
- **correctif** : description, exemple, sans effet sur les clients.

**Chaîne d'intégration**
- Actions GitHub **figées par empreinte SHA**, avec la version en commentaire ; Dependabot les met à jour.
- Droits des workflows en lecture seule par défaut ; seul le job de publication peut écrire.

**Protection de `main`** (dès que GitHub Pro est actif, via le GitHub Student Developer Pack) : PR obligatoire, contrôles requis (Backend, Frontend, Images Docker, Commits et titre), fusion par merge commit uniquement, force-push et suppression interdits. Pas de règle « historique linéaire », incompatible avec les merge commits.

### Conséquences

* Bon : aucun commit n'est perdu ni réécrit ; chaque commit remonte à sa PR, puis à son issue.
* Bon : versions et journal des changements produits sans effort, à partir des messages déjà écrits.
* Bon : une action tierce compromise ne peut pas s'introduire par un tag déplacé.
* Mauvais : chaque commit doit être propre ; une branche brouillonne pollue l'historique de façon définitive.
* Mauvais : l'historique de `main` n'est plus linéaire ; il se lit avec `--first-parent`.
* Mauvais : une PR ouverte par le jeton par défaut des workflows ne déclenche pas la CI. Une fois `main` protégée, la PR de version aura besoin d'un jeton dédié (jeton personnel à droits fins, en secret) pour que ses contrôles s'exécutent.
* Mauvais : la version racine des `package-lock.json` n'est pas mise à jour par release-please (sans effet sur `npm ci`).

### Déclencheurs de révision

- Plusieurs livrables versionnés séparément (par exemple une API publique) : versions par paquet avec release-please en mode multi-paquets.
- Images Docker publiées : tags SemVer des images, signature et preuve d'origine (SLSA).
- Plusieurs contributeurs réguliers : relecture obligatoire, `CODEOWNERS`, commits signés exigés.
