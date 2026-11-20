# User stories du palier 1

Référence des critères d'acceptation. Le cadrage est dans [PRODUCT.md](PRODUCT.md).

**Vocabulaire :** un *membre* est un utilisateur connecté. Une piste est *privée* (visible de son propriétaire seulement) ou *membres* (visible de tous les membres). « Refusé sans révéler » signifie que la réponse ne permet pas de savoir si la ressource existe.

## Identité

### 1. S'inscrire
*En tant que musicien, je veux créer un compte, afin de présenter mon travail.*
- Étant donné un visiteur, quand il fournit un nom, une adresse e-mail et un mot de passe valides et accepte les conditions d'utilisation, alors son compte est créé et il est connecté.
- Étant donné un visiteur, quand il n'accepte pas les conditions d'utilisation, alors l'inscription est refusée.
- Étant donné une adresse e-mail déjà utilisée, quand un visiteur s'inscrit avec elle, alors l'inscription est refusée avec un message clair.
- Étant donné un champ invalide, quand le visiteur envoie le formulaire, alors le champ en erreur est indiqué et aucun compte n'est créé.
- Étant donné une inscription réussie, alors l'acceptation des conditions est enregistrée avec sa date et la version du texte.

### 2. Se connecter et se déconnecter
*En tant que musicien inscrit, je veux me connecter et me déconnecter, afin de protéger mon compte.*
- Étant donné un compte existant, quand le musicien fournit ses identifiants corrects, alors il est connecté.
- Étant donné une adresse inconnue ou un mot de passe faux, quand quelqu'un tente de se connecter, alors la connexion est refusée avec **le même message** dans les deux cas.
- Étant donné un membre, quand il se déconnecte, alors les pages réservées ne lui sont plus accessibles.
- Étant donné une session expirée, quand le musicien fait une action réservée, alors il est renvoyé vers la connexion.

## Profil

### 3. Remplir son profil
*En tant que membre, je veux décrire qui je suis comme musicien, afin d'être trouvé.*
- Étant donné un membre, quand il enregistre son nom, ses instruments, ses genres, sa ville et sa présentation, alors son profil affiche ces informations.
- Étant donné un nom vide ou une présentation trop longue, quand il enregistre, alors la modification est refusée et le champ en erreur est indiqué.
- Étant donné un membre, quand il tente de modifier le profil d'un autre, alors la modification est refusée.
- Étant donné un profil sans photo, alors les initiales du musicien sont affichées.

### 4. Afficher un moyen de contact
*En tant que membre, je veux afficher un lien ou une adresse e-mail, afin qu'on puisse me joindre.*
- Étant donné un membre, quand il enregistre un lien ou une adresse valide, alors ce contact apparaît sur son profil pour les autres membres.
- Étant donné une valeur qui n'est ni un lien ni une adresse valide, quand il enregistre, alors elle est refusée.
- Étant donné un membre, quand il retire son contact, alors il n'apparaît plus nulle part.
- Étant donné un visiteur non connecté, alors aucun contact ne lui est jamais transmis.

### 5. Consulter le profil d'un musicien
*En tant que membre, je veux voir le profil d'un autre musicien, afin de savoir ce qu'il joue.*
- Étant donné un membre, quand il ouvre le profil d'un autre musicien, alors il voit ses informations, son contact s'il existe et ses pistes *membres*.
- Étant donné des pistes privées sur ce profil, alors elles n'apparaissent pas et leur nombre n'est pas révélé.
- Étant donné un profil inexistant, quand un membre l'ouvre, alors un message « introuvable » s'affiche.
- Étant donné un visiteur non connecté, quand il ouvre un profil, alors l'accès est refusé.

## Portfolio

### 6. Déposer une piste
*En tant que membre, je veux déposer un morceau avec mes crédits, afin de montrer ce que j'ai joué.*
- Étant donné un membre, quand il fournit un titre, un fichier audio accepté, son rôle ou instrument et l'attestation de droits, alors la piste est créée, **privée par défaut**.
- Étant donné une attestation non cochée, quand il dépose, alors le dépôt est refusé.
- Étant donné un fichier d'un format refusé ou trop volumineux, quand il dépose, alors le dépôt est refusé avec un message clair et rien n'est conservé.
- Étant donné un dépôt réussi, alors l'attestation est enregistrée : qui, quelle piste, quand.
- Étant donné un envoi en cours, alors sa progression est visible et un second envoi est impossible.

### 7. Gérer ses pistes
*En tant que membre, je veux lister, corriger et supprimer mes pistes, afin de tenir mon portfolio à jour.*
- Étant donné un membre, quand il ouvre « Mes pistes », alors il voit toutes ses pistes, privées comprises, par pages.
- Étant donné une de ses pistes, quand il modifie le titre ou les crédits, alors la modification est visible aussitôt.
- Étant donné une de ses pistes, quand il la supprime après confirmation, alors elle disparaît partout et son fichier est supprimé.
- Étant donné la piste d'un autre, quand il tente de la modifier ou de la supprimer, alors c'est refusé sans révéler.

### 8. Choisir la visibilité
*En tant que membre, je veux décider qui entend chaque piste, afin de garder la main sur mon travail.*
- Étant donné une piste privée, quand son propriétaire la passe en *membres*, alors les autres membres peuvent la voir et l'écouter.
- Étant donné une piste *membres*, quand son propriétaire la repasse en privée, alors elle disparaît aussitôt de « Découvrir », de la recherche et de son profil public.
- Étant donné la piste d'un autre, quand un membre tente d'en changer la visibilité, alors c'est refusé sans révéler.

### 9. Écouter une piste
*En tant que membre, je veux écouter un morceau, afin de juger le jeu d'un musicien.*
- Étant donné un membre, quand il lance une de ses pistes ou une piste *membres* d'un autre, alors elle est lue.
- Étant donné la piste privée d'un autre, quand un membre tente de l'écouter, alors c'est refusé sans révéler.
- Étant donné un visiteur non connecté, quand il tente d'écouter une piste, alors c'est refusé.
- Étant donné une lecture impossible, alors un message compréhensible s'affiche.

## Découvrir

### 10. Parcourir les pistes récentes
*En tant que membre, je veux voir les derniers morceaux partagés, afin de découvrir des musiciens.*
- Étant donné des pistes *membres*, quand un membre ouvre « Découvrir », alors il les voit de la plus récente à la plus ancienne, avec le titre, le musicien et les crédits.
- Étant donné plus de pistes qu'une page, alors chaque changement de page est demandé au serveur.
- Étant donné des pistes privées, alors aucune n'apparaît.
- Étant donné aucune piste, alors un message d'état vide s'affiche.

## Recherche

### 11. Chercher des musiciens
*En tant que membre, je veux chercher par instrument, genre ou ville, afin de trouver avec qui jouer.*
- Étant donné un membre, quand il cherche avec un ou plusieurs critères, alors il obtient les musiciens qui les remplissent tous, par pages.
- Étant donné une ville saisie avec une casse ou des accents différents, alors les mêmes musiciens sont trouvés.
- Étant donné aucun résultat, alors un message le dit et propose d'élargir la recherche.
- Étant donné un visiteur non connecté, quand il cherche, alors l'accès est refusé.

### 12. Chercher des pistes
*En tant que membre, je veux chercher un morceau par les mots de son titre, afin de le retrouver.*
- Étant donné un membre, quand il saisit un ou plusieurs mots d'un titre, alors il obtient les pistes *membres* dont le titre contient ces mots, sans tenir compte de la casse ni des accents, par pages.
- Étant donné un début de mot seulement (« blu » pour « blues »), alors la piste n'est pas trouvée : la recherche porte sur des mots entiers (ADR 0005).
- Étant donné des pistes privées dont le titre correspond, alors elles n'apparaissent pas, même pour leur propriétaire (il les retrouve dans « Mes pistes »).
- Étant donné aucun résultat, alors un message le dit.

## Confiance

### 13. Signaler une piste
*En tant que membre, je veux signaler un morceau, afin d'alerter sur un contenu qui pose problème.*
- Étant donné une piste *membres*, quand un membre la signale avec un motif, alors le signalement est enregistré (qui, quelle piste, quand, pourquoi) et une confirmation s'affiche.
- Étant donné un membre qui a déjà signalé cette piste, quand il la signale à nouveau, alors aucun doublon n'est créé.
- Étant donné un signalement, alors le propriétaire de la piste n'en voit ni l'auteur ni l'existence.
