# Matrice d'autorisation

Qui peut faire quoi au palier 1. Chaque ligne devient au moins un **test d'API**, refus compris. Vocabulaire : [DOMAIN.md](DOMAIN.md).

## Politique de réponse

| Situation | Réponse |
|---|---|
| Action réservée, demandée sans être connecté | **401**, sans autre détail |
| Ressource qui n'existe pas | **404** |
| Ressource d'un autre membre que l'on n'a pas le droit de voir (piste privée) | **404** : refus **sans révéler** qu'elle existe |
| Modification ou suppression de la piste d'un autre, même visible | **404**, pour une règle unique sur les pistes des autres |
| Données invalides | **400**, avec le champ en erreur |
| Trop de tentatives (connexion, inscription) | **429**, message neutre (ADR 0006) |
| Requête qui modifie des données sans l'en-tête `Origin` de ListenIn (requête forgée, SEC-10) | **403** |

Une seule règle à retenir : **ce qu'on n'a pas le droit de toucher n'existe pas pour nous.** Le code 403 ne sert donc **jamais** à refuser l'accès à une ressource ; il est réservé aux requêtes d'une origine étrangère, refusées avant tout examen des droits.

## Matrice

V = visiteur, M = membre (pas propriétaire), P = propriétaire. ✅ autorisé, ❌ refusé (code entre parenthèses).

| N° | Action | V | M | P | Story |
|---|---|---|---|---|---|
| A1 | S'inscrire | ✅ | – | – | 1 |
| A2 | Se connecter | ✅ | – | – | 2 |
| A3 | Se déconnecter | – | ✅ | ✅ | 2 |
| A4 | Modifier un profil (le sien uniquement : il n'existe pas de route vers celui d'un autre) | ❌ (401) | – | ✅ | 3 |
| A5 | Modifier ou retirer son contact | ❌ (401) | – | ✅ | 4 |
| A6 | Consulter un profil | ❌ (401) | ✅ | ✅ | 5 |
| A7 | Voir le contact d'un profil | ❌ (401) | ✅ | ✅ | 4, 5 |
| A8 | Déposer une piste | ❌ (401) | – | ✅ | 6 |
| A9 | Lister ses pistes, privées comprises | ❌ (401) | – | ✅ | 7 |
| A10 | Modifier titre et crédits d'une piste | ❌ (401) | ❌ (404) | ✅ | 7 |
| A11 | Supprimer une piste | ❌ (401) | ❌ (404) | ✅ | 7 |
| A12 | Changer la visibilité d'une piste | ❌ (401) | ❌ (404) | ✅ | 8 |
| A13 | Voir ou écouter une piste *membres* | ❌ (401) | ✅ | ✅ | 9 |
| A14 | Voir ou écouter une piste *privée* | ❌ (401) | ❌ (404) | ✅ | 9 |
| A15 | Parcourir « Découvrir » (pistes *membres* seulement) | ❌ (401) | ✅ | ✅ | 10 |
| A16 | Chercher des musiciens | ❌ (401) | ✅ | ✅ | 11 |
| A17 | Chercher des pistes (pistes *membres* seulement, même pour le propriétaire) | ❌ (401) | ✅ | ✅ | 12 |
| A18 | Signaler une piste *membres* (une fois) | ❌ (401) | ✅ | ❌ (400) | 13 |
| A19 | Signaler une piste *privée* | ❌ (401) | ❌ (404) | ❌ (400) | 13 |
| A20 | Savoir qu'une piste est signalée, ou par qui | ❌ | ❌ | ❌ | 13 |

## Règles de filtrage

Au-delà des droits sur une action, ce que **contiennent** les réponses :

- **F1.** Un profil consulté par un autre membre n'indique ni ses pistes privées ni leur **nombre**.
- **F2.** Les listes de « Découvrir » et de recherche ne contiennent **jamais** de piste privée, y compris pour leur propriétaire.
- **F3.** Aucune réponse à un membre autre que le propriétaire ne contient l'attestation ni les signalements d'une piste.
- **F4.** Un message de connexion refusée est **identique** pour une adresse inconnue et pour un mauvais mot de passe.

## Tests à écrire

Pour chaque ligne A1 à A20 : un test par cas ✅ et un test par cas ❌, plus un test par règle F1 à F4. Les tests nomment la ligne qu'ils couvrent (par exemple `A14 : un membre ne peut pas écouter la piste privée d'un autre (404)`), pour que la matrice reste la table de couverture.

## Points tranchés ailleurs

- **Inscription avec une adresse déjà utilisée** : message clair, risque accepté (ADR 0006).

## Points à confirmer

- **A18, se signaler soi-même** : refusé (400) parce que ça n'a pas de sens. À confirmer.
