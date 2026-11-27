# ADR 0011 : instruments et genres en listes fermées

- Statut : acceptée
- Date : 2026-11-27
- Confiance : élevée
- Réversibilité : facile au palier 1 (ajouter un élément), modérée ensuite (renommer un code)

## Contexte et problème

Le profil d'un musicien indique ses instruments et ses genres (story 3). La recherche de musiciens s'appuie dessus (story 11 : « guitare, blues »), avec des index (PERF-2). Il faut décider comment ces valeurs sont saisies : choisies dans une liste ou tapées librement.

## Options envisagées

* **A. Listes fermées** : le musicien choisit dans une liste d'instruments et une liste de genres, définies par ListenIn
* **B. Saisie libre** : le musicien tape ce qu'il veut
* **C. Mixte** : une liste, plus une saisie libre « autre », à normaliser plus tard

## Étude comparative

Notes sur 5.

| Critère | Poids | A | B | C |
|---|---|---|---|---|
| Fiabilité de la recherche (« guitare » trouve tous les guitaristes) | 30 | 5 | 2 | 4 |
| Qualité des données (doublons, fautes, variantes) | 20 | 5 | 2 | 3 |
| Liberté du musicien (instrument rare) | 20 | 3 | 5 | 4 |
| Coût de réalisation et de maintenance | 15 | 4 | 4 | 2 |
| Évolution (traduction, filtres, regroupements) | 15 | 5 | 1 | 3 |
| **Total** | | **89 %** | **55 %** | **67 %** |

B donnerait « guitare », « gtr », « Guitare élec. » et « guitar » pour un même instrument : la recherche, cœur du scénario de démonstration, en souffrirait dès le départ. C cumule les coûts des deux, avec un nettoyage à prévoir.

## Décision

Option retenue : **A, listes fermées**.

- **Codes stables** en anglais (`electric-guitar`, `blues`…), définis comme énumérations dans le **contrat OpenAPI** : l'API refuse tout code inconnu (400), l'application reçoit la liste avec ses types générés.
- **Libellés en français** dans l'application ; une autre langue n'ajoutera que des libellés.
- Environ **40 instruments** et **25 genres** au départ ; **10 au plus** de chaque par profil.
- **Ajouter** un élément : une PR qui étend l'énumération, version **mineure** du contrat. **Renommer ou retirer** un code : version majeure et migration des profils, à éviter.
- La **ville** reste en **saisie libre**, cherchable sans tenir compte de la casse ni des accents (ADR 0005).

### Conséquences

* Bon : une recherche et des filtres fiables dès la première tranche qui les utilise.
* Bon : aucune donnée à nettoyer, aucune modération des intitulés.
* Mauvais : un instrument absent n'est pas sélectionnable tant qu'on ne l'a pas ajouté.
* Mauvais : la liste est à tenir à jour, par des PR.

### Déclencheurs de révision

- Des demandes d'ajout fréquentes : revoir l'étendue des listes, ou ajouter un « autre » libre (option C).
- Les profils professionnels (après le palier 1) : une classification à deux niveaux (famille, instrument) pourra devenir nécessaire.
