# ADR 0008 : accès à MongoDB avec Mongoose

- Statut : acceptée
- Date : 2026-11-22
- Confiance : moyenne
- Réversibilité : modérée (l'accès aux données est isolé dans chaque module)

## Contexte et problème

L'ADR 0005 retient MongoDB et renvoie à la première tranche le choix de la bibliothèque d'accès. L'entrée de l'API est déjà validée par le contrat OpenAPI (ADR 0007). Il faut décider comment le backend lit et écrit les documents, et ce qui protège leur forme.

## Options envisagées

* **A. Mongoose** : schémas par modèle, contrôles à chaque écriture, valeurs par défaut, `populate`
* **B. Pilote officiel `mongodb`** : collections typées par TypeScript, plus un validateur `$jsonSchema` dans la base

## Étude comparative

Les critères et leurs poids reflètent les priorités du projet : la protection des données, la proximité avec le cours, puis le confort et la justesse du code.

| Critère | Poids | A | B |
|---|---|---|---|
| Chaque écriture est contrôlée, quel que soit le code qui écrit | 25 | 5 | 4 |
| Alignement avec le cours de Technologies Web | 20 | 5 | 3 |
| Productivité (valeurs par défaut, `populate`, connexion gérée) | 15 | 5 | 3 |
| Pas de description en double avec le contrat | 15 | 3 | 3 |
| Précision du typage TypeScript | 15 | 3 | 5 |
| Prévisibilité (pas de conversion implicite) | 10 | 3 | 5 |
| **Total** | | **84 %** | **76 %** |

B type mieux et n'ajoute aucune couche. Mais il faut écrire soi-même ce que Mongoose fournit, et il s'écarte du cours. Les deux options gardent une seconde description des documents à côté du contrat : schémas Mongoose ou validateur `$jsonSchema`.

## Décision

Option retenue : **A, Mongoose**. Il contrôle chaque écriture, suit le cours et réduit le code à écrire. Ses pièges sont fermés par des réglages globaux, posés dans `src/database.ts` avant toute définition de schéma :

| Réglage | Raison |
|---|---|
| `sanitizeFilter: true` | Un opérateur (`$ne`, `$gt`…) venu d'une requête est traité comme une valeur, jamais comme un opérateur (ADR 0005) |
| `strict: 'throw'` | Un champ inconnu à l'écriture est une erreur, pas une donnée ignorée |
| `strictQuery: 'throw'` | Un filtre sur un champ inconnu est une erreur ; ignoré, il renverrait **tous** les documents |
| `autoIndex: false` | Les index sont créés au démarrage par `ensureIndexes()` ; un échec (doublon sur un index unique) empêche l'API de démarrer |

**Règles d'usage**
- Chaque module définit ses modèles et en est le seul utilisateur (MAI-3). Les modules importent `mongoose` depuis `src/database.ts`.
- Une interface TypeScript par document, passée au schéma (`Schema<T>`).
- Les règles métier restent dans les services des modules, pas dans des middlewares Mongoose : le hachage d'un mot de passe, par exemple, est un appel explicite dans le service d'inscription.
- Le contrat valide ce qui entre par l'API ; Mongoose garantit la forme de ce qui est écrit en base.
- Les tests utilisent une base en mémoire (`mongodb-memory-server`), avec une version de MongoDB fixée dans `package.json`.

### Conséquences

* Bon : chaque écriture est contrôlée, même par un code ou un script qui ne passe pas par l'API.
* Bon : la syntaxe est celle du cours, avec moins de code à écrire.
* Bon : l'injection d'opérateurs et les champs mal nommés sont bloqués par configuration, et testés.
* Mauvais : les documents sont décrits à deux endroits (contrat et schémas), à garder d'accord par les tests.
* Mauvais : les types de Mongoose sont moins précis que ceux du pilote.
* Mauvais : une couche de plus entre le code et MongoDB.

### Déclencheurs de révision

- Les types de Mongoose freinent réellement le développement, ou une montée de version de Mongoose casse les modules : passer au pilote officiel, module par module.
- Un besoin que Mongoose couvre mal (agrégations lourdes, flux de données) : utiliser le pilote pour ce cas, via `mongoose.connection.db`.
