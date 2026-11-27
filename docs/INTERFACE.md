# Registre d'interface

Quels composants et blocs Spartan chaque écran utilise, et les règles qui s'appliquent à tous. Base technique : [ADR 0010](adr/0010-base-interface-spartan.md).

Un composant n'est **installé** que dans la pull request de l'écran qui l'utilise (`npx ng g @spartan-ng/cli:ui <composant>`) ; ce registre en garde la décision d'ici là. Il est mis à jour dans chaque pull request qui touche à l'interface.

## Règles

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
| Modifier mon profil | **Dialog** (Sheet si le formulaire déborde, mesuré) ; Field, Input, Combobox, **Textarea**, **Sonner**, **Skeleton** | tranche Profil (#66) |
| Complétez votre profil | page entière après l'inscription, mêmes champs, bouton « Plus tard » | tranche Profil (#66) |
| Profil d'un musicien | Avatar, Badge, **Skeleton**, état « introuvable » | tranche Profil (#67) |
| Déposer une piste | Dialog ; **Progress** (envoi du fichier), **Textarea** (crédits), Checkbox (attestation), **Sonner** | tranche Portfolio |
| Lecteur audio | composant ListenIn : balise `<audio>`, **Slider** (position, volume), Button | tranche Portfolio |
| Découvrir | liste de pistes, **Skeleton**, état vide, pagination | tranche Découvrir |
| Messagerie entre membres | **Message** + Message Scroller | palier 2 |
| Navigation latérale | **Sidebar**, si le menu grandit | candidate, palier 2 |

Aucune bibliothèque libre ne propose de lecteur audio : le lecteur de ListenIn est un composant à nous, construit sur le Slider de Spartan.
