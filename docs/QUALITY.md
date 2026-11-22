# Exigences de qualité

Les exigences **non fonctionnelles** du palier 1 : ce que le produit doit garantir, au-delà de ce qu'il fait. Elles sont classées selon les caractéristiques d'ISO/IEC 25010, utilisée comme **liste de contrôle** et non comme norme de conformité (ADR 0002).

Chaque exigence a une **vérification**. Une exigence qu'on ne sait pas vérifier n'est pas écrite ici.

**Les chiffres sont des cibles initiales**, choisies pour être raisonnables, pas mesurées. On les révise au premier vrai mesurage, par une pull request qui modifie ce fichier.

## Sécurité

| N° | Exigence | Vérification |
|---|---|---|
| SEC-1 | Les mots de passe sont **hachés** avec un algorithme conçu pour cela ; ils ne sont jamais stockés, renvoyés ni journalisés en clair. Algorithme : Argon2id (ADR 0006) | test + revue |
| SEC-2 | L'autorisation est appliquée **par l'API**, selon [AUTHORIZATION.md](AUTHORIZATION.md). Le frontend ne protège rien | tests A1 à A20 et F1 à F4 |
| SEC-3 | Toute entrée est **validée à la frontière** HTTP par un schéma ; une entrée invalide reçoit 400 et ne touche pas aux données | tests |
| SEC-4 | Le secret de session **n'est pas lisible** par le JavaScript de la page : cookie `HttpOnly`, `Secure`, `SameSite=Strict` (ADR 0006) | test des en-têtes de réponse |
| SEC-5 | Les tentatives de connexion et d'inscription sont **limitées** ; au-delà, 429. Seuils dans l'ADR 0006 | test |
| SEC-6 | Un fichier audio est vérifié par son **contenu**, pas seulement par son extension ; sa taille est plafonnée ; il n'est jamais servi par une adresse publique devinable, et son accès suit les droits de sa piste (A13, A14) | tests |
| SEC-7 | Les réponses portent les **en-têtes de sécurité** (helmet côté API, en-têtes nginx côté frontend) | test (déjà en place pour l'API) |
| SEC-8 | Aucun secret dans le dépôt ; aucune dépendance de production avec une faille **haute** ou **critique** connue | CI : `npm audit` (en place) |
| SEC-9 | Les journaux ne contiennent ni mot de passe, ni en-tête `Authorization`, ni cookie | test du masquage (en place) + revue |
| SEC-10 | Toute requête qui modifie des données est refusée si son en-tête `Origin` n'est pas celui de ListenIn (CSRF) | test |
| SEC-11 | Un mot de passe de moins de 15 ou de plus de 128 caractères est refusé, sans règle de composition (ADR 0006) | tests |

## Fiabilité

| N° | Exigence | Vérification |
|---|---|---|
| FIA-1 | Un dépôt de piste est **tout ou rien** : en cas d'échec, ni piste sans fichier, ni fichier sans piste | test d'échec simulé |
| FIA-2 | Supprimer une piste supprime son fichier ; un échec de suppression du fichier est journalisé et rattrapable | test |
| FIA-3 | L'API s'arrête **proprement** sur SIGTERM : elle termine les requêtes en cours avant de quitter | en place |
| FIA-4 | Les erreurs inattendues renvoient 500 **sans détail interne** et sont journalisées avec l'identifiant de la requête | test (en place) |

Les **sauvegardes** de la base et des fichiers font partie des points bloquants avant ouverture ([PRODUCT.md](PRODUCT.md)), pas du palier 1.

## Performance

| N° | Exigence | Vérification |
|---|---|---|
| PERF-1 | Toute liste est **paginée par le serveur**, avec une taille de page plafonnée à 50 éléments | tests |
| PERF-2 | Les recherches et « Découvrir » s'appuient sur des **index** de la base, jamais sur un parcours complet | plan d'exécution des requêtes, vérifié à la tranche « recherche » |
| PERF-3 | La lecture d'une piste commence **sans télécharger tout le fichier** : l'API accepte les requêtes partielles (HTTP `Range`) | test |
| PERF-4 | Cible : 95 % des réponses de l'API en moins de **300 ms** hors envoi de fichier, avec un jeu de démonstration de 10 000 pistes | mesure locale, à la tranche « recherche » |
| PERF-5 | Le chargement initial du frontend reste sous le **budget** du CLI Angular : avertissement à 500 ko, échec à 1 Mo | build en CI (en place) |

## Utilisabilité et accessibilité

| N° | Exigence | Vérification |
|---|---|---|
| ACC-1 | Les écrans principaux respectent les **WCAG 2.2 niveau AA** | outil automatique (axe) + vérification manuelle |
| ACC-2 | Tout se fait **au clavier**, lecteur audio compris, avec un focus toujours visible | vérification manuelle par écran |
| ACC-3 | Chaque erreur de formulaire est **reliée à son champ** et annoncée aux lecteurs d'écran | tests de composants |
| ACC-4 | L'interface est utilisable de **360 px** de large jusqu'au bureau | vérification manuelle |
| ACC-5 | Chaque attente a un état visible (chargement, envoi en cours, liste vide, erreur) | tests de composants |

L'interface est en **français** au palier 1 ; la traduction n'est pas prévue.

## Compatibilité

| N° | Exigence | Vérification |
|---|---|---|
| COM-1 | Navigateurs pris en charge : ceux que supporte Angular 22 (les versions récentes de Chrome, Edge, Firefox et Safari) | vérification manuelle avant chaque palier |

## Maintenabilité

| N° | Exigence | Vérification |
|---|---|---|
| MAI-1 | Aucune fusion dans `main` sans **CI verte** : formatage, lint, types stricts, tests, build | CI (en place) |
| MAI-2 | Chaque critère d'acceptation de [USER-STORIES.md](USER-STORIES.md) est couvert par **au moins un test**. Le taux de couverture sert d'indicateur, pas d'objectif | revue de pull request |
| MAI-3 | Un module du backend ne lit ni n'écrit **les données d'un autre** ; il passe par l'interface que l'autre expose ([DOMAIN.md](DOMAIN.md)) | revue, puis règle de lint dès qu'il y a deux modules |
| MAI-4 | Le contrat **OpenAPI** décrit exactement les routes en place (ADR 0003) | CI : `redocly lint`, validation des réponses dans les tests, types Angular à jour (ADR 0007) |

## Portabilité

| N° | Exigence | Vérification |
|---|---|---|
| POR-1 | Toute la configuration passe par des **variables d'environnement**, validées au démarrage | test (en place) |
| POR-2 | Chaque application tourne dans **son image Docker**, sans dépendre de la machine hôte | build des images en CI (en place) |
| POR-3 | Le code métier ne dépend d'**aucun fournisseur** de stockage : les fichiers audio passent par une interface, pour pouvoir changer de stockage sans toucher aux domaines | revue |

## Données personnelles

| N° | Exigence | Vérification |
|---|---|---|
| DON-1 | On ne collecte que ce que les stories demandent : adresse e-mail, mot de passe, profil, contact, pistes | revue du modèle de données |
| DON-2 | Aucun traceur ni outil de mesure d'audience tiers | revue |

La suppression du compte et la vérification juridique sont bloquantes **avant ouverture**, pas au palier 1 ([PRODUCT.md](PRODUCT.md)).
