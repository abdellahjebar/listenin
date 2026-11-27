# ADR 0010 : base d'interface avec Spartan et Tailwind v4

- Statut : acceptée
- Date : 2026-11-27
- Confiance : moyenne (étude sur sources, sans essai comparatif sur du code)
- Réversibilité : modérée au début, coûteuse une fois les écrans construits

## Contexte et problème

Aucun écran ne peut être construit sans base d'interface (issue #17). Exigences en jeu : accessibilité WCAG 2.2 AA, clavier et erreurs reliées aux champs (ACC-1 à ACC-3) ; identité visuelle propre à ListenIn, en thème clair et sombre ; maintenance par une seule personne ; licence libre. Le porteur du projet trouve l'apparence d'Angular Material datée.

## Options envisagées

Filtre éliminatoire : licence libre, compatibilité avec Angular 22 et le mode sans zone.

* **Spartan** : comportements accessibles (*brain*, construit sur le CDK) et composants Tailwind copiés dans le dépôt (*helm*), dans l'esprit de shadcn/ui
* **Angular Aria et CDK** : comportements officiels d'Angular, sans style ; composants entièrement à écrire
* **ng-primitives**, **Zard UI**, **Taiga UI**
* Écartés par le filtre ou l'apparence : Angular Material (apparence), **Syncfusion** (licence propriétaire : gratuite sous conditions, puis 5 995 dollars par an au minimum, clé à changer à chaque version majeure, bandeau si elle ne correspond plus), PrimeNG 22 (devenu propriétaire), Kendo, DevExtreme, NG-ZORRO, Clarity, Nebular et Flowbite Angular (pas d'Angular 22)

## Étude comparative

Relevés du 23 novembre 2026 (npm, GitHub, documentation officielle). Notes sur 5.

| Critère | Poids | Spartan | Aria + CDK | ng-primitives | Zard | Taiga |
|---|---|---|---|---|---|---|
| Accessibilité | 30 | 4 | 5 | 4 | 3 | 3 |
| Maturité, pérennité | 20 | 4 | 4 | 3 | 2 | 4 |
| Liberté visuelle, Tailwind, deux thèmes | 20 | 5 | 5 | 5 | 5 | 2 |
| Coût pour une personne | 15 | 4 | 2 | 2 | 4 | 3 |
| Poids, performance | 10 | 4 | 5 | 5 | 4 | 3 |
| Alignement avec le cours (son projet de départ utilise Spartan) | 5 | 5 | 3 | 2 | 2 | 1 |
| **Total** | | **85 %** | **85 %** | 74 % | 68 % | 58 % |

Spartan et Angular Aria sont à égalité pour des raisons opposées : Spartan fournit des composants prêts à styliser (champ, boîte de dialogue, notifications, tableau, composants de chat avec `role="log"`), Angular Aria l'accessibilité officielle mais tout est à construire.

## Décision

Option retenue : **Spartan**, parce qu'il couvre les besoins des tranches à venir pour un coût bien moindre, sous licence MIT, avec une accessibilité reposant sur le CDK, et qu'il suit le cours.

**Mise en place**
- Tailwind v4 par `@tailwindcss/postcss` (`.postcssrc.json`), preset Spartan importé dans `src/styles.css`.
- Composants *helm* copiés par l'outil de Spartan dans `libs/ui` (alias `@spartan-ng/helm/*`), ajoutés au besoin : `npx ng g @spartan-ng/cli:ui <composant>`. Ils sont à nous, relus et testés comme le reste du code ; seule leur règle de préfixe (`hlm`, `brn`) diffère.
- ~~Thème sombre piloté par le réglage du système.~~ **Thème clair par défaut** (voir « Modifications ») ; le thème sombre reste prêt derrière la classe `.dark` (variante du preset Spartan) pour un futur sélecteur de thème.
- Couleurs : base « neutral » de Spartan, **provisoire**. Le fond et la couleur d'accent de ListenIn seront choisis ensemble, dans une PR qui ne changera que les jetons.

**Syncfusion comme source d'idées seulement** (licence propriétaire) : ses blocs servent de modèles de mise en page ; on les **reconstruit** avec les composants Spartan et nos jetons, sans jamais copier leur code ni dépendre de ses paquets.

**Règles d'usage**
- Les composants n'utilisent **que les jetons** (`bg-primary`, `text-muted-foreground`…), jamais une couleur en dur.
- Classes utilitaires dans les templates ; pas de `@apply`, sauf pour surcharger un style tiers ; feuilles de style de composant quasi vides.
- Composants composés propres à ListenIn dans `src/app/shared/ui` ; composants de base dans `libs/ui`.
- Un bloc vu ailleurs (Syncfusion, shadcn, Zard) est **porté** : structure reprise, code React ou propriétaire jamais copié.
- Chaque écran est vérifié au clavier et avec axe dans les deux thèmes.

### Conséquences

* Bon : une seule apparence et un seul système de thème ; licence MIT, sans clé ni condition.
* Bon : le code des composants est dans le dépôt : on peut le lire, l'adapter et le corriger.
* Mauvais : les composants copiés ne se mettent pas à jour seuls ; l'outil de Spartan fournit des migrations à lancer.
* Mauvais : accessibilité garantie par une équipe de neuf contributeurs réguliers, sans audit public : elle se vérifie écran par écran.
* Mauvais : l'outil de Spartan (dépendance de développement) embarque une version de `zod` signalée par l'audit. Il n'est jamais livré dans l'application : l'audit de production reste propre, l'audit complet le signalera jusqu'à sa mise à jour.
* Mauvais : aucun lecteur audio n'existe dans les bibliothèques libres ; celui du portfolio sera un composant de ListenIn.

### Modifications

- **2026-11-27 : thème clair par défaut.** Décision du porteur du projet après essai des écrans : l'application s'affiche en clair quel que soit le réglage du système. Les jetons sombres restent sous `:root.dark` ; aucun élément ne pose encore cette classe.
- **2026-11-27 : Spartan d'abord, d'autres bibliothèques admises.** Décision du porteur du projet : quand Spartan n'a pas un composant, une autre bibliothèque peut s'ajouter (Zard UI, ng-primitives…), si sa licence est libre, qu'elle suit Angular 22, que son apparence reste cohérente avec nos jetons et que son accessibilité est vérifiée. Chaque cas est noté dans [docs/INTERFACE.md](../INTERFACE.md).
- **2026-11-27 : écrans d'identité à la hauteur de la fenêtre.** Les pages d'inscription et de connexion ne défilent jamais ; si le formulaire dépasse (petit écran, zoom), seule sa colonne défile, ce qui respecte WCAG 1.4.10. L'image fournie par le porteur du projet occupe la colonne de droite.

### Déclencheurs de révision

- Un défaut d'accessibilité de Spartan qui bloque un écran : combler avec Angular Aria ou ng-primitives pour ce composant.
- Spartan n'est plus maintenu ou ne suit plus Angular.
- Un composant lourd absent des bibliothèques libres (éditeur riche, agenda complet) : l'évaluer à part, isolé derrière un composant de ListenIn.
