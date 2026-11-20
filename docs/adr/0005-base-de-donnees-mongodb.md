# ADR 0005 : MongoDB seul pour les données et les fichiers audio

- Statut : acceptée
- Date : 2026-11-20
- Confiance : moyenne
- Réversibilité : modérée

## Contexte et problème

La première tranche a besoin d'une base. Il faut aussi un endroit pour le contenu des fichiers audio. Les exigences en jeu :

- **règles « tout ou rien »** : aucune piste sans attestation (invariant 4), aucun compte sans acceptation des conditions (invariant 7), dépôt atomique (FIA-1) ;
- **unicité** : une adresse e-mail par compte, un signalement par membre et par piste (invariant 5) ;
- **recherche avec index** (PERF-2) : musiciens par instrument, genre et ville, sans tenir compte de la casse ni des accents (story 11) ; pistes par leur titre (story 12) ;
- **lecture audio partielle** (PERF-3), fichier jamais exposé directement (SEC-6).

## Options envisagées

* **PostgreSQL seul**, plus un stockage de fichiers à part (disque ou stockage objet)
* **MongoDB seul**, fichiers audio dans GridFS
* **Les deux** : PostgreSQL pour les données, MongoDB (GridFS) pour les fichiers

## Étude comparative

Notes sur 5, poids sur 85.

| Critère | Poids | PostgreSQL seul | MongoDB seul |
|---|---|---|---|
| Colle au modèle et fait respecter les règles | 25 | 5 | 3 |
| Couvre la recherche du palier 1 avec des index | 20 | 5 | 3 |
| Alignement avec le cours de Technologies Web, qui utilise MongoDB | 15 | 3 | 5 |
| Exploitation : un seul système pour les données et les fichiers, Docker, CI | 15 | 4 | 5 |
| Évolution du schéma | 10 | 4 | 4 |
| **Total** | | **87 %** | **76 %** |

L'option **les deux** additionne les forces de PostgreSQL pour les données et de GridFS pour les fichiers, mais elle impose **deux systèmes** à faire tourner, sauvegarder et démarrer en CI, pour une seule personne. Son gain par rapport à MongoDB seul se limite, au palier 1, à des règles garanties par la base plutôt que par la conception et à une recherche par morceau de texte plutôt que par mots.

## Décision

Option retenue : **MongoDB seul**, avec les fichiers audio dans **GridFS**, parce que les règles du palier 1 se modélisent proprement en documents, qu'un seul système garde l'exploitation proportionnée, et que ce choix suit le cours.

PostgreSQL l'emporte sur les critères techniques purs. L'écart est accepté en échange de deux engagements :

1. **Une règle de conception : une règle « tout ou rien » tient dans un seul document.** L'attestation est enregistrée *dans* la piste, l'acceptation des conditions *dans* le compte. Une écriture sur un document est atomique : pas de transaction multi-documents au palier 1.
2. **Un changement de produit :** la story 12 cherche une piste par les **mots** de son titre (index texte), et non par un morceau de texte quelconque.

Règles d'application :

- **Unicité** par des index uniques (adresse e-mail ; couple membre et piste pour les signalements).
- **Ville, instruments, genres** : index avec une collation qui ignore la casse et les accents.
- **Pas de clé étrangère** : la suppression d'une piste supprime son fichier et ses signalements dans le module Portfolio, couverte par des tests (invariant 3, FIA-2).
- **Piste et fichier** ne sont pas écrits en une seule opération. Au dépôt : le fichier d'abord, puis la piste ; si la piste échoue, le fichier est supprimé (FIA-1). Un fichier orphelin restant est journalisé.
- **Lecture partielle** : GridFS permet de lire une portion d'un fichier ; l'API traduit les requêtes HTTP `Range` après avoir vérifié les droits.
- **Schéma** : validé à l'entrée par zod (SEC-3) ; la forme des documents est définie dans le code de chaque module. Une validation rejette tout opérateur MongoDB (`$ne`, `$gt`…) venu d'une requête, contre l'injection.
- **Accès aux données isolé par module** (MAI-3) : aucun autre code ne parle à la base. Le stockage des fichiers passe par une interface (POR-3).
- Le choix entre **Mongoose et le pilote officiel**, la version exacte et l'hébergement se décident à la première tranche. Les tests utilisent une base en mémoire.

### Conséquences

* Bon : un seul système de données, en local, en CI et plus tard en production.
* Bon : le modèle en documents colle aux profils (listes d'instruments et de genres) et aux pistes (crédits).
* Mauvais : la justesse des liens entre données repose sur la conception et les tests, pas sur la base.
* Mauvais : « blu » ne trouve pas « blues » ; seule une recherche par mots est possible sans service d'hébergement spécifique (Atlas Search).
* Mauvais : GridFS est moins courant qu'un stockage objet (S3, MinIO) pour servir des fichiers ; l'interface de stockage permet d'en changer.

### Déclencheurs de révision

On rouvre cette décision, par un nouvel ADR, si l'un de ces cas apparaît :

- une règle exige d'écrire **plusieurs documents** en tout ou rien ;
- les données deviennent **très liées** (palier 2 : réseau, contacts, partages ciblés) ;
- la recherche par mots ne suffit plus aux utilisateurs ;
- l'hébergement retenu rend un stockage objet nettement plus simple que GridFS.
