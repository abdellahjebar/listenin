# ADR 0007 : outillage du contrat OpenAPI

- Statut : acceptée
- Date : 2026-11-20
- Confiance : moyenne
- Réversibilité : modérée

## Contexte et problème

L'ADR 0003 fait de `openapi.yaml` la source de vérité du contrat d'API, écrite avant le code, et renvoie à une étude le choix des outils : validation des requêtes, types TypeScript pour Angular, documentation, contrôle en CI. Le risque à éviter : décrire l'API deux fois (contrat et validation) et laisser le contrat s'écarter du code (MAI-4).

## Options envisagées (source de la description)

* **A. Contrat d'abord** : `openapi.yaml` écrit à la main ; l'API valide requêtes et réponses par rapport à lui ; les types en sont générés
* **B. Code d'abord** : schémas zod dans le backend ; `openapi.yaml` en est généré (remplacerait le principe de l'ADR 0003)

## Étude comparative

| Critère | Poids | A | B |
|---|---|---|---|
| Une seule source, pas de description en double | 25 | 5 | 5 |
| Le contrat est lisible et relu avant le code | 20 | 5 | 3 |
| Un écart entre contrat et code est détecté | 20 | 4 | 5 |
| Typage dans le code du backend | 15 | 3 | 5 |
| Apprentissage et maintenance des outils | 20 | 4 | 3 |
| **Total** | | **86 %** | **84 %** |

L'écart est faible. A garde le contrat comme un document de conception relu dans la pull request, et la même source sert au backend, au frontend et à la documentation. B élimine l'écart par construction et type mieux le backend, mais fait du contrat un produit dérivé, avec des bibliothèques de génération à partir de zod 4 encore jeunes.

## Décision

Option retenue : **A, contrat d'abord**, qui confirme l'ADR 0003.

**Emplacement** : `backend/openapi.yaml` (l'image Docker du backend ne voit que son dossier).

**Validation (backend)** : `express-openapi-validator` (Express 5 depuis la version 5.5, OpenAPI 3.1 depuis la 5.4).
- Requêtes validées en toutes circonstances : une requête hors contrat reçoit 400 (SEC-3).
- Réponses validées pendant les **tests** : une réponse hors contrat fait échouer le test. C'est la détection d'écart.
- zod reste pour la configuration (`src/config.ts`) et les règles métier que le contrat ne peut pas exprimer.

**Format d'erreur constant** (conventions REST de Microsoft), décrit dans le contrat et appliqué par le gestionnaire d'erreurs :

```json
{ "error": { "code": "ValidationError", "message": "…", "details": [{ "target": "email", "message": "…" }] } }
```

**Types pour Angular** : `openapi-typescript`, **types seuls**. Les services Angular gardent `HttpClient`, les intercepteurs et `HttpTestingController`. Les types générés sont versionnés dans `frontend/`.

**Vérification et documentation** : Redocly CLI, pour vérifier les règles du contrat (`redocly lint`), générer une page de documentation statique et la prévisualiser en local. La documentation n'est pas servie par l'API en production.

**Contrôles en CI**
1. `redocly lint` sur le contrat.
2. Tests de l'API avec validation des réponses.
3. Types Angular régénérés puis comparés au dépôt : un écart fait échouer la CI.

L'outillage s'installe avec la **première route** (tranche « identité ») ; la route existante `/api/health` est décrite à ce moment-là.

### Conséquences

* Bon : une seule description de l'API, relue avant le code, qui alimente validation, types et documentation.
* Bon : un écart entre contrat et code est détecté par les tests, sans effort de plus.
* Bon : aucune bibliothèque ajoutée à l'application Angular.
* Mauvais : le YAML écrit à la main est verbeux.
* Mauvais : les gestionnaires de routes du backend sont typés à partir des types générés, moins finement qu'avec zod.
* Mauvais : `express-openapi-validator` repose sur peu de mainteneurs.

### Déclencheurs de révision

- `express-openapi-validator` n'est plus maintenu, ou bloque une montée de version d'Express : passer au code d'abord avec zod.
- Écrire le YAML à la main devient un frein réel à l'ajout de routes.
- Le besoin d'un client complet (plusieurs applications clientes) : réévaluer un générateur de services.
