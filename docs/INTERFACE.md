# Registre d'interface

Quels composants et blocs Spartan chaque écran utilise, et les règles qui s'appliquent à tous. Base technique : [ADR 0010](adr/0010-base-interface-spartan.md).

Un composant n'est **installé** que dans la pull request de l'écran qui l'utilise (`npx ng g @spartan-ng/cli:ui <composant>`) ; ce registre en garde la décision d'ici là. Il est mis à jour dans chaque pull request qui touche à l'interface.

## Règles

- **Spartan d'abord.** Quand Spartan n'a pas le composant voulu, une autre bibliothèque est admise (Zard UI, ng-primitives…), à quatre conditions : licence libre, compatibilité avec Angular 22, apparence cohérente (mêmes jetons, famille shadcn de préférence) et accessibilité vérifiée. Le choix est noté dans le tableau ci-dessous, avec sa raison.

- Les composants n'utilisent **que les jetons** (`bg-primary`, `text-muted-foreground`…), jamais une couleur en dur. Couleurs provisoires : base « neutral » ; fond et accent de ListenIn à choisir ensemble.
- **Thème clair** par défaut ; le thème sombre reste prêt derrière la classe `.dark`.
- Un bloc vu ailleurs (Spartan, shadcn, Zard, Syncfusion) est **porté** : la mise en page est reprise, son code React ou propriétaire n'est jamais copié.
- **Écrans sans défilement** quand ils tiennent sur une page (identité, formulaires) : messages d'aide et d'erreur sur la ligne du libellé ; la colonne ne défile qu'en cas de zoom ou de petit écran (WCAG 1.4.10).
- Chaque écran : erreurs reliées à leur champ, focus sur la première erreur, parcours au clavier, analyse axe sans violation.
- Pas de raccourcis clavier propres à ListenIn : ils entrent en conflit avec ceux du navigateur et des lecteurs d'écran.

## Écrans

| Écran | Composants ou bloc | Statut |
|---|---|---|
| Inscription | bloc `signup-two-column` ; Field, Input, Checkbox, Button, Spinner | fait (v0.2.0) |
| Connexion | bloc `login-two-column` ; Field, Input, Button, Spinner | fait (v0.2.0) |
| Coquille de l'application connectée | barre de navigation ; **Avatar** (initiales) + **Dropdown Menu** : Mon profil, Modifier mon profil, Se déconnecter | tranche Profil (#66) |
| Modifier mon profil | **Dialog** (Sheet si le formulaire déborde, mesuré) ; Field, Input, **Combobox multiple avec recherche pendant la frappe** pour les instruments et les genres (Autocomplete si un seul choix), **Textarea**, **Sonner**, **Skeleton** | tranche Profil (#66) |
| Complétez votre profil | page entière après l'inscription, mêmes champs, bouton « Plus tard » | tranche Profil (#66) |
| Profil d'un musicien | Avatar, Badge, **Skeleton**, état « introuvable », **Empty** sans bouton si aucune piste partagée (rien ne révèle les pistes privées, F1) | tranche Profil (#67) |
| Mon portfolio | liste de pistes, **Empty** (« Aucune piste pour l'instant », bouton « Déposer une piste ») | tranche Portfolio |
| Déposer une piste | Dialog ; **Progress** (envoi du fichier), **Textarea** (crédits), Checkbox (attestation), **Sonner** | tranche Portfolio |
| Lecteur audio | composant ListenIn : balise `<audio>`, **Slider** (position, volume), Button | tranche Portfolio |
| États vides (aucune piste, aucun résultat) | **Empty** : icône, titre, texte, bouton d'action si l'utilisateur peut agir | dès le premier écran concerné |
| Découvrir | liste de pistes, **Skeleton**, **Empty**, pagination | tranche Découvrir |
| Messagerie entre membres | **Message** + Message Scroller | palier 2 |
| Navigation latérale | **Sidebar**, si le menu grandit | candidate, palier 2 |

Aucune bibliothèque libre ne propose de lecteur audio : le lecteur de ListenIn est un composant à nous, construit sur le Slider de Spartan.
