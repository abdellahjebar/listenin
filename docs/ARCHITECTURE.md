# Architecture

## État actuel
```text
frontend/  Angular 22, application vide
backend/   Express 5 + TypeScript, route GET /api/health, configuration validée, journaux structurés
```
Aucune base de données ni authentification n'est encore branchée.

## Architecture cible
```text
Navigateur ──► Frontend (Angular) ──► API (Express) ──► MongoDB
                                         └──► stockage des fichiers audio
```

**Monolithe modulaire** : un seul backend déployable, organisé en domaines indépendants.

| Domaine | Responsabilité |
|---|---|
| Identité | comptes, authentification, session |
| Profil | informations du musicien |
| Portfolio | pistes audio, visibilité (privée ou publique) |
| Réseau | contacts, partages |
| Recherche | recherche de pistes et de musiciens |

Chaque domaine possède ses routes, sa logique et ses modèles, et n'expose aux autres qu'une interface claire. Le découpage se fait **au fur et à mesure** des tranches, sans grande refonte préalable.

## Principes
- **Autorisation au backend** : le frontend n'améliore que l'ergonomie, il ne protège rien.
- **Entrées non fiables** : validation à la frontière HTTP.
- **Configuration par environnement**, validée au démarrage ; aucun secret dans le dépôt.
- **Observabilité** : journaux JSON, identifiant de requête, point de santé.
- **Tests des règles d'accès**, y compris les refus.

## « Pas maintenant »
Chaque complexité n'entre que si son déclencheur apparaît.

| Pas maintenant | On l'ajoute quand |
|---|---|
| File de tâches | un traitement audio en arrière-plan est nécessaire (transcodage, forme d'onde) |
| Moteur de recherche dédié | la recherche par index de la base devient trop limitée |
| Microservices | un composant ou une équipe doit se déployer seul |
| Infrastructure as code | on dépasse un environnement simple |
| Gestion d'état globale (NgRx) | les Signals ne suffisent plus à partager l'état |

## Décisions
Voir [adr/](adr/).
