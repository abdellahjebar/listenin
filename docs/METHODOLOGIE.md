# Méthodologies de documentation et de décision : catalogue

> **Statut : référence.** Résultat de la phase de recherche. La sélection retenue est consignée dans l'[ADR 0002](adr/0002-methodologie-documentaire.md) et, pour l'API, dans l'[ADR 0003](adr/0003-contrat-api-openapi.md).

## Comment lire ce catalogue
Chaque méthode reçoit un verdict pour **ListenIn** (un produit construit par une personne, destiné à être déployé plus tard) :

- **Maintenant** : utile dès le départ, coût faible.
- **Plus tard** : utile, mais pas avant qu'un besoin réel apparaisse.
- **Ignorer** : disproportionné pour ce projet.

## Fiabilité des sources
- Les résultats de recherche sont des **synthèses**, pas les pages complètes. Les détails sont à confirmer sur les sites officiels listés en fin de document.
- **Sources officielles retrouvées** : Microsoft Learn (ADR, analyse de domaine, piliers Well-Architected), playbook d'ingénierie de Microsoft, site de arc42, Google AIP, Google Cloud (ADR).
- **Sources secondaires** (blogs, résumés) pour : C4, Diátaxis, documents de conception de Google, mémos d'Amazon, INVEST et Gherkin, docs-as-code. Leur contenu est cohérent entre elles, mais le texte original n'a pas été lu.
- **Non étudié** dans cette recherche : OpenAPI, Event Storming, modélisation des menaces (STRIDE), Microsoft Security Development Lifecycle, DORA, guides de style de rédaction. Voir la fin du document.

---

## 1. Documenter l'architecture

| Méthode | Ce que c'est | Coût | Verdict |
|---|---|---|---|
| **Docs as code** | La documentation vit dans Git, change par pull request, est relue comme du code ; des contrôles automatiques à chaque mise à jour | nul (déjà en place) | **Maintenant** |
| **Modèle C4** (Simon Brown) | Quatre niveaux de schémas : *contexte* (le système et ses acteurs), *conteneurs* (unités déployables), *composants*, *code* | faible | **Maintenant** pour les niveaux 1 et 2 (en Mermaid dans le dépôt) ; niveau 3 seulement pour un module complexe ; niveau 4 ignoré (rarement utile, souvent généré) |
| **arc42** | Gabarit de 12 sections : introduction et buts, contraintes, contexte, stratégie de solution, vue en blocs, vue d'exécution, vue de déploiement, concepts transverses, décisions, qualité, risques et dette, glossaire | moyen | **Version allégée** : on reprend le squelette des sections utiles (contexte, blocs, concepts transverses, qualité, risques, glossaire), pas les 12 d'un coup |
| **Diátaxis** | Quatre types de documents, **un seul par page** : tutoriel (apprendre), guide pratique (atteindre un but), référence (consulter), explication (comprendre) | faible | **Maintenant**, comme règle de rangement : référence (contrat d'API), explication (architecture, ADR), guides pratiques (démarrer, déployer) |

## 2. Décider et le consigner

| Méthode | Ce que c'est | Coût | Verdict |
|---|---|---|---|
| **ADR** (Nygard) | Une décision, une page : contexte, décision, conséquences. Journal **en ajout seulement** : une décision acceptée ne se modifie pas, on la remplace par une nouvelle liée à l'ancienne | faible | **Maintenant** (déjà amorcé) |
| **Recommandations Microsoft sur les ADR** | Toujours donner le contexte et la justification ; noter le **niveau de confiance** de la décision ; couper une décision en plusieurs ADR si elle a plusieurs phases ; suivre un gabarit constant | faible | **Maintenant** : on ajoute « confiance » et « réversibilité » au gabarit |
| **MADR 4.0** | Gabarit Markdown d'ADR (versions « minimal », « bare » et complète), avec les options envisagées | faible | **Maintenant**, version « minimal » enrichie des options envisagées |
| **Journal des décisions** (playbook Microsoft) | Un tableau : décision, date, alternatives, raisonnement, lien vers l'ADR, auteur | nul | **Déjà couvert** par le tableau de `docs/adr/README.md` |
| **Étude comparative** (*trade study*, playbook Microsoft) | Quand plusieurs solutions satisfont les mêmes exigences : critères, options, comparaison | moyen | **Maintenant** pour les choix à plusieurs options (interface, stockage audio, base de données, recherche) |
| **Document de conception** (Google) | Écrit **avant** de coder, sans format imposé ; sections courantes : contexte et périmètre, **buts et non-buts**, vue d'ensemble, conception détaillée, **alternatives écartées**, préoccupations transverses, questions ouvertes. Inutile quand la solution est évidente | moyen | **Maintenant**, mais seulement pour les fonctionnalités non triviales (modèle de visibilité, règles d'accès) |
| **Décisions à sens unique ou réversibles** (Bezos) | Les décisions difficiles à défaire se prennent lentement et avec méthode ; les réversibles vite | nul | **Maintenant**, comme champ « réversibilité » dans chaque ADR |
| **PR/FAQ et mémo de six pages** (Amazon) | On rédige d'abord le communiqué de presse du produit fini (moins d'une page), puis une FAQ ; les mémos remplacent les diapositives | moyen à élevé | **Version allégée** : un paragraphe « communiqué » et une courte FAQ en tête de `PRODUCT.md`. Le mémo de six pages : **ignorer** |

## 3. Définir le produit et les exigences

| Méthode | Ce que c'est | Coût | Verdict |
|---|---|---|---|
| **Analyse de domaine et contextes délimités** (DDD stratégique, Microsoft Learn) | Chaque contexte a **son modèle** et **son langage commun** (le même mot peut changer de sens d'un contexte à l'autre). Un module ne doit pas être plus grand qu'un contexte | faible à moyen | **Maintenant** : carte des contextes et glossaire. Les motifs tactiques (agrégats, services de domaine) seulement là où la complexité le justifie |
| **User stories + INVEST** | Une histoire courte du point de vue de l'utilisateur ; INVEST (Bill Wake, 2003) est une aide au jugement, pas un test réussi ou raté | faible | **Maintenant** |
| **Critères d'acceptation Given/When/Then** | Le contexte, l'action, le résultat attendu, directement testables ; de 3 à 7 scénarios par histoire (repère empirique) | faible | **Maintenant** |
| **Découpage vertical** | Une petite tranche complète, de l'interface à la base | nul | **Maintenant** (c'est déjà notre plan de tranches) |
| **ISO/IEC 25010** | Modèle de qualité : fonctionnalité, performance, compatibilité, utilisabilité, fiabilité, sécurité, maintenabilité, portabilité. **Attention :** l'édition 2011 est retirée, une édition 2023 la remplace, et sa liste exacte n'a pas été vérifiée | faible | **Maintenant**, comme liste de contrôle des exigences non fonctionnelles, sans prétendre à une conformité |

## 4. Concevoir l'API

| Méthode | Ce que c'est | Coût | Verdict |
|---|---|---|---|
| **Microsoft REST API Guidelines** | Règles sur les méthodes HTTP, les URL, la **taxonomie des erreurs** (4xx pour une donnée invalide), le **versionnage** (paramètre `api-version` daté), la **pagination** pilotée par le serveur | moyen | **Sous-ensemble** : format d'erreur constant, pagination, politique de versionnage. Pas l'ensemble des règles |
| **Google AIP** (API Improvement Proposals) | Conception **orientée ressources** : des noms (ressources) et peu de verbes ; méthodes standard (Get, List, Create, Update, Delete) de préférence aux méthodes personnalisées | faible | **Maintenant** : URL par ressource, méthodes standard d'abord |

## 5. Évaluer l'architecture avant de déployer

| Méthode | Ce que c'est | Coût | Verdict |
|---|---|---|---|
| **Well-Architected Framework** (Microsoft) | Cinq piliers : fiabilité, sécurité, optimisation des coûts, excellence opérationnelle, efficacité des performances ; les compromis entre piliers sont explicites | moyen | **Plus tard** : une revue avant le premier déploiement |
| **Revues de conception** (playbook Microsoft) | Garder la conception à jour dans le dépôt, journaliser les décisions, consigner les études comparatives | faible | **Version solo** : liste de contrôle avant chaque tranche, et relecture de la pull request |

---

## Sélection retenue

**Maintenant :** docs as code, C4 (niveaux 1 et 2), arc42 allégé comme squelette, Diátaxis comme règle de rangement, ADR au format MADR « minimal » avec confiance et réversibilité, études comparatives pour les choix à plusieurs options, documents de conception pour les fonctionnalités non triviales, DDD stratégique léger (contextes et glossaire), user stories INVEST avec critères Given/When/Then, ISO 25010 comme liste de contrôle, conventions d'API tirées de Microsoft et de Google.

**Plus tard :** revue Well-Architected avant le premier déploiement ; sécurité formelle (SDL, STRIDE) au durcissement.

**Ignorer :** mémo de six pages, C4 niveau 4, arc42 complet, l'ensemble des règles d'API de Microsoft.

## Règles de proportion
1. Aucun document sans lecteur ni décision à porter.
2. Deux pages au plus par document.
3. La documentation évolue **dans la même pull request que le code**.
4. Toute décision notable a son ADR, avec options, conséquences, confiance et réversibilité.
5. On n'écrit un document de conception que lorsque la solution n'est pas évidente.

## Décisions prises
- **Format des ADR :** MADR « minimal », avec les champs « Confiance » et « Réversibilité » (ADR 0002).
- **Schémas :** Mermaid, dans les fichiers Markdown (ADR 0002).
- **Contrat d'API :** OpenAPI dès la première route (ADR 0003).
- **Sélection des méthodes :** consignée dans l'ADR 0002.

## Pas encore étudié
OpenAPI (étude prévue avant la première route, voir l'ADR 0003), Event Storming, modélisation des menaces (STRIDE), Microsoft Security Development Lifecycle, métriques DORA, pratiques de revue de code de Google, guides de style de rédaction (Microsoft, Google).

## Sources
- Microsoft Learn : [Architecture decision record](https://learn.microsoft.com/en-us/azure/well-architected/architect-role/architecture-decision-record)
- Microsoft Learn : [Domain analysis](https://learn.microsoft.com/en-us/azure/architecture/microservices/domain-analysis) et [Tactical DDD](https://learn.microsoft.com/azure/architecture/microservices/model/tactical-ddd)
- Microsoft Learn : [Piliers du Well-Architected Framework](https://learn.microsoft.com/en-us/training/modules/azure-well-architected-introduction/2-pillars)
- Microsoft : [Engineering Fundamentals Playbook](https://microsoft.github.io/code-with-engineering-playbook/), [Design Decision Log](https://microsoft.github.io/code-with-engineering-playbook/design/design-reviews/decision-log/), [Design Reviews](https://microsoft.github.io/code-with-engineering-playbook/design/design-reviews/), [Trade Study Template](https://microsoft.github.io/code-with-engineering-playbook/design/design-reviews/trade-studies/template/)
- Microsoft : [REST API Guidelines](https://github.com/dnovhorodov/api-guidelines/blob/vNext/Guidelines.md) (copie d'un dépôt dérivé ; le dépôt officiel est `microsoft/api-guidelines`)
- Google : [API Improvement Proposals](https://google.aip.dev/) et [AIP-121](https://google.aip.dev/121)
- Google Cloud : [Architecture decision records](https://docs.cloud.google.com/architecture/architecture-decision-records)
- arc42 : [Les 12 sections](https://arc42.org/overview)
- MADR : [adr.github.io/madr](https://adr.github.io/madr)
- Malte Ubl : [Design docs at Google (résumé)](https://www.industrialempathy.com/posts/design-doc-a-design-doc/)
- Amazon : [The Amazon Writing Culture](https://www.theprfaq.com/articles/amazon-writing-culture) et [Passages des lettres aux actionnaires](https://founderstribune.org/p/10-passages-from-jeff-bezos-s-shareholder-letters)
- C4 : [InfoQ, « C4 architecture model »](https://www.infoq.com/articles/c4-architecture-model/)
- Diátaxis : [Canonical, « Diátaxis, a new foundation »](https://canonical.com/blog/diataxis-a-new-foundation-for-canonical-documentation)
- Docs as code : [Cloudflare](https://blog.cloudflare.com/our-docs-as-code-approach/) et [GitLab](https://docs.gitlab.com/development/documentation/workflow/)
- User stories : [Capgemini, INVEST](https://capgemini.github.io/agile/invest-in-user-stories)
- Qualité : [ISO/IEC 25010](https://www.iso.org/standard/35733.html)
