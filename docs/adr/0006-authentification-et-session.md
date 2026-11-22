# ADR 0006 : authentification par session côté serveur

- Statut : acceptée
- Date : 2026-11-20
- Confiance : élevée pour le mécanisme, moyenne pour les seuils
- Réversibilité : modérée

## Contexte et problème

Les stories 1 et 2 demandent l'inscription, la connexion, une vraie déconnexion et l'expiration de session. Les exigences en jeu : mots de passe hachés (SEC-1), secret de session illisible par le JavaScript de la page (SEC-4), tentatives limitées (SEC-5), même message pour une adresse inconnue et un mauvais mot de passe (F4). L'application et l'API sont servies sous la même adresse ([ARCHITECTURE.md](../ARCHITECTURE.md)).

Six points sont à trancher : le mécanisme de session, le hachage, la politique de mot de passe, la durée de session, la limitation des tentatives et le message « adresse déjà utilisée ».

## Options envisagées (mécanisme)

* **A. Session côté serveur** : numéro de session aléatoire dans un cookie `HttpOnly`, session enregistrée dans MongoDB
* **B. JWT dans un cookie `HttpOnly`** : rien n'est stocké côté serveur
* **C. JWT gardé par l'application** (`localStorage`) et envoyé dans l'en-tête `Authorization`, comme dans le cours

## Étude comparative

| Critère | Poids | A | B | C |
|---|---|---|---|---|
| Sécurité : un script injecté ne peut pas voler la session | 35 | 5 | 4 | 1 |
| Vraie déconnexion et expiration | 20 | 5 | 2 | 2 |
| Simplicité | 20 | 4 | 3 | 4 |
| Alignement avec le cours | 15 | 3 | 4 | 5 |
| Montée en charge | 10 | 4 | 5 | 5 |
| **Total** | | **88 %** | **70 %** | **59 %** |

C contredit SEC-4 : une seule faille XSS suffit à voler le jeton. B ne permet pas d'annuler un jeton avant son expiration sans liste noire côté serveur, ce qui revient à une session, en plus compliqué.

## Décision

Option retenue : **A, session côté serveur**, parce qu'elle seule satisfait à la fois SEC-4 et une vraie déconnexion, sans système de plus (MongoDB stocke déjà les données, ADR 0005).

**Session**
- Cookie `HttpOnly`, `Secure`, `SameSite=Strict`, contenant seulement un numéro aléatoire.
- Nouveau numéro à chaque connexion (contre la fixation de session).
- Expiration après **7 jours sans activité**, **30 jours** au maximum. La déconnexion détruit la session côté serveur.
- Session absente ou expirée : **401** ; l'application renvoie vers la connexion.

**Requêtes forgées (CSRF)** : en plus de `SameSite=Strict`, l'API refuse toute requête qui modifie des données si son en-tête `Origin` n'est pas celui de ListenIn.

**Hachage** : **Argon2id**, au minimum 19 Mio de mémoire, 2 itérations, 1 fil (recommandation de l'OWASP). Le choix entre `crypto.argon2()` de Node (disponible depuis la version 24.7) et la bibliothèque `argon2` se fait à la première tranche, selon la stabilité de la version de Node.

**Politique de mot de passe** (NIST SP 800-63B-4, mot de passe seul facteur)
- **15 caractères minimum**, **128 au maximum** (la norme exige d'en accepter au moins 64 ; le plafond borne le coût du hachage), aucune règle de composition.
- ~~Refus des mots de passe courants (liste locale).~~ Retiré le 2026-11-22, voir « Modifications ».
- Aucun changement imposé à intervalle régulier.

**Limitation des tentatives**
- Connexion : 5 échecs en 15 minutes par couple adresse IP et adresse e-mail ; 100 tentatives en 15 minutes par adresse IP.
- Inscription : 10 par heure par adresse IP.
- Au-delà : **429** avec un message neutre. Compteurs en mémoire tant qu'il n'y a qu'une instance de l'API.

**« Adresse déjà utilisée »** : message clair à l'inscription, comme le prévoit la story 1. C'est un **risque accepté** : le message révèle qu'un compte existe, freiné par la limite d'inscriptions. La connexion garde un message identique dans tous les cas (F4).

### Conséquences

* Bon : la session ne peut pas être lue par un script, et la déconnexion est réelle.
* Bon : aucun nouveau système ; toutes les instances de l'API partagent les sessions via MongoDB.
* Bon : le frontend ne gère aucun jeton : le navigateur envoie le cookie seul.
* Mauvais : une lecture en base par requête authentifiée.
* Mauvais : ça s'écarte du cours, qui montre un jeton géré par l'application.
* Mauvais : 15 caractères minimum peut surprendre des utilisateurs habitués à moins.

### Modifications

- **2026-11-22 : pas de liste de mots de passe courants.** Décision du porteur du projet à la première tranche. C'est un **écart accepté** à la norme NIST SP 800-63B-4, qui exige cette vérification ; le minimum de 15 caractères reste la protection principale. Le cookie de session s'appelle `__Host-session` : le préfixe impose `Secure`, `Path=/` et aucun domaine.

### Déclencheurs de révision

- Arrivée du service d'e-mails (mot de passe oublié) : passer le message d'inscription à un message identique suivi d'un e-mail.
- Ajout d'un second facteur : la norme autorise alors 8 caractères minimum.
- Des comptes compromis par des mots de passe courants : ajouter la liste de refus.
- Plusieurs instances de l'API : déplacer les compteurs de tentatives dans MongoDB.
- Un client hors navigateur (application mobile, API publique) : réévaluer les jetons.
