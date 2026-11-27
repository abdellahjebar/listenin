# Produit

Document de référence du **palier 1**. Les critères d'acceptation détaillés sont dans [USER-STORIES.md](USER-STORIES.md).

## En une phrase
ListenIn est un réseau pour musiciens : chacun y présente ce qu'il a joué, et on l'**écoute** avant de jouer avec lui.

## Le communiqué (ce que dira la première version)
Un guitariste qui cherche un groupe crée son profil, dépose trois morceaux avec ses crédits et les ouvre aux membres. Une bassiste de la même ville le trouve en cherchant « guitare, blues », écoute ses morceaux, et le contacte par le lien qu'il a laissé sur son profil.

**Questions fréquentes**
- *Qui peut écouter mes morceaux ?* Personne tant qu'ils sont privés. Les membres connectés, si vous les ouvrez aux membres. Jamais un visiteur sans compte.
- *Comment me contacte-t-on ?* Par le lien ou l'adresse que vous choisissez d'afficher. Il n'y a pas de messagerie.
- *Puis-je déposer une reprise ?* Seulement si vous en avez le droit : vous l'attestez à chaque dépôt, et tout morceau peut être signalé.

## Utilisateurs visés
Musiciens **amateurs et semi-professionnels** : groupes locaux, jam sessions, projets. Le profil et les crédits sont conçus pour s'étendre plus tard aux professionnels.

Deux personas fictifs guident les choix :
- **Lina**, guitariste amateur, veut montrer ce qu'elle joue et trouver un groupe près de chez elle.
- **Marc**, batteur d'un groupe, cherche un bassiste et veut l'entendre avant de le rencontrer.

## Décisions de cadrage
| Sujet | Décision |
|---|---|
| Écoute | Réservée aux utilisateurs connectés |
| Visibilité d'une piste | *Privée* (par défaut) ou *membres* ; le niveau « public sur le web » viendra quand le besoin se présentera |
| Contact | Un champ optionnel (lien ou adresse e-mail), visible des membres seulement |
| Crédits | Par piste : le rôle ou l'instrument joué, et un texte libre pour les autres musiciens |
| Droits d'auteur | Conditions d'utilisation à l'inscription, attestation enregistrée à chaque dépôt, signalement, retrait possible |

## Périmètre du palier 1
| Domaine | User stories |
|---|---|
| Identité | 1. S'inscrire · 2. Se connecter et se déconnecter |
| Profil | 3. Remplir son profil · 4. Afficher un moyen de contact · 5. Consulter le profil d'un musicien |
| Portfolio | 6. Déposer une piste · 7. Gérer ses pistes · 8. Choisir la visibilité · 9. Écouter une piste |
| Découvrir | 10. Parcourir les pistes récentes |
| Recherche | 11. Chercher des musiciens · 12. Chercher des pistes (par les mots du titre) |
| Confiance | 13. Signaler une piste |

## Hors périmètre du palier 1
| Exclu | Prévu pour |
|---|---|
| Demandes de contact, réseau, partage ciblé d'une piste privée | Palier 2 |
| Lien de partage vers l'extérieur, écoute sans compte | Quand le besoin se présentera |
| Messagerie interne | Non prévue |
| Flux d'activité, annonces, lecteur enrichi (forme d'onde, égaliseur) | Plus tard |
| Vérification des crédits, tarifs, disponibilités | Extension vers les professionnels |
| Interface d'administration et de modération | Les signalements se traitent à la main |
| Photo de profil (des initiales la remplacent) | Plus tard |
| Application mobile, notifications, paiement | Non prévus |

## Bloquant avant toute ouverture à d'autres utilisateurs
Ces points ne bloquent pas le développement, seulement la mise en ligne :
- mot de passe oublié ;
- traitement des signalements et retrait d'une piste par l'exploitant ;
- suppression de son compte et de ses données ;
- vérification du cadre juridique (droits d'auteur, données personnelles, conditions d'utilisation), qui **n'a pas encore été faite**.

## Le palier 1 est réussi quand
1. **Le scénario de démonstration passe** avec deux comptes de test : s'inscrire, remplir son profil, déposer une piste, l'ouvrir aux membres, être trouvé par l'autre compte, être écouté, afficher le contact.
2. Chaque user story a ses critères d'acceptation **couverts par des tests**.
3. La **matrice d'autorisation** est testée, refus compris.
4. La CI est verte.
5. L'accessibilité est vérifiée sur les écrans principaux.

Un essai avec de vrais musiciens est le critère du palier suivant : il suppose un déploiement restreint et les points bloquants ci-dessus.

## Questions ouvertes
- ~~Instruments et genres : liste fermée ou saisie libre ?~~ Listes fermées, voir l'[ADR 0011](adr/0011-instruments-et-genres.md).
- Formats audio, taille et durée maximales : à décider à la tranche « portfolio » (le stockage est choisi : ADR 0005).
