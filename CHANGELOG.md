# Changelog

## [0.2.0](https://github.com/abdellahjebar/listenin/compare/v0.1.0...v0.2.0) (2026-11-27)


### Fonctionnalités

* **frontend:** base d'interface avec Spartan et Tailwind v4 ([5b003fc](https://github.com/abdellahjebar/listenin/commit/5b003fc389bfcb221eefee82dd821fa37136c1bb))
* **frontend:** écran d'inscription (story 1) ([14c2217](https://github.com/abdellahjebar/listenin/commit/14c22175b6c0138b86c0484e9d7f346019fbb6fb))
* **frontend:** écran d'inscription d'après le bloc Spartan signup-two-column ([d00ac6c](https://github.com/abdellahjebar/listenin/commit/d00ac6c5448ddfa2c5ec1d6c784ae442ea7cc96d))
* **frontend:** écran de connexion d'après le bloc Spartan login-two-column ([7b98187](https://github.com/abdellahjebar/listenin/commit/7b98187050eefa84b9742c2fbc8a69ca87448758))
* **frontend:** écran de connexion et déconnexion (story 2) ([58bb602](https://github.com/abdellahjebar/listenin/commit/58bb6027f4611fbbe3a67f5aaf8d2182e02820c6))
* **frontend:** écrans d'identité à la hauteur de la fenêtre, avec l'affiche en colonne de droite ([f946f0b](https://github.com/abdellahjebar/listenin/commit/f946f0b33873f7a92bf1793ef4b1c3ea6bab75ca))
* **frontend:** raccordement à l'API des comptes et état du membre connecté ([c1335bc](https://github.com/abdellahjebar/listenin/commit/c1335bc6dfb01acc21a53fc8eb0199acb6addac7))
* **frontend:** sessions côté application (connexion, reprise au démarrage, déconnexion) ([ab9e5cc](https://github.com/abdellahjebar/listenin/commit/ab9e5cc12232ad184644cb02d80866b130789992))
* **frontend:** thème clair et sombre qui suit le système, coquille ListenIn ([a87d278](https://github.com/abdellahjebar/listenin/commit/a87d2783928cd40ccb3f2118bbc2251ed2b18eb4))
* **frontend:** thème clair par défaut ([674affc](https://github.com/abdellahjebar/listenin/commit/674affc1dc1a3d15755c4e27a3a4ad5ac1f301d3))


### Corrections

* **frontend:** titre de connexion sur une ligne, comme dans le bloc ([3e30d6d](https://github.com/abdellahjebar/listenin/commit/3e30d6d2bd7c948824f35a0995da782908a65430))


### Documentation

* ADR 0010, base d'interface avec Spartan et Tailwind v4 ([ae871af](https://github.com/abdellahjebar/listenin/commit/ae871af81f16f9734d536f0f00791971dd89b8f5))
* ADR 0010, thème clair par défaut et écrans sans défilement ([548a66b](https://github.com/abdellahjebar/listenin/commit/548a66bda4c2187f59735bd9b3d6bbe490d9d294))
* adresse de l'écran de connexion ([9752666](https://github.com/abdellahjebar/listenin/commit/975266676f5029f48efa856b57b5f61d65e50d1e))
* lancer l'application avec le proxy de l'API, statut de l'inscription ([45160c5](https://github.com/abdellahjebar/listenin/commit/45160c504bedebc004534c34e6d307a427dc8c94))

## [0.1.0](https://github.com/abdellahjebar/listenin/compare/v0.0.0...v0.1.0) (2026-11-27)


### Fonctionnalités

* **backend:** outillage du contrat OpenAPI ([#32](https://github.com/abdellahjebar/listenin/issues/32)) ([702e1ee](https://github.com/abdellahjebar/listenin/commit/702e1ee1322236101612b2518eb7f9fea0d804f9))
* **backend:** socle MongoDB avec Mongoose (ADR 0008) ([#38](https://github.com/abdellahjebar/listenin/issues/38)) ([c292bcb](https://github.com/abdellahjebar/listenin/commit/c292bcb2cf8c27a11b36be2ebedba226775e5bcd))
* **identity:** connexion, session en cours et déconnexion (story 2) ([#42](https://github.com/abdellahjebar/listenin/issues/42)) ([1716ea2](https://github.com/abdellahjebar/listenin/commit/1716ea2d825375995f2517e416b14f30a7668d4d))
* **identity:** inscription avec ouverture de session (story 1) ([#40](https://github.com/abdellahjebar/listenin/issues/40)) ([15b0978](https://github.com/abdellahjebar/listenin/commit/15b097866c7f149a54ea34c22625e63bb73b8527))


### Documentation

* ADR 0005, MongoDB seul pour les données et les fichiers audio ([#27](https://github.com/abdellahjebar/listenin/issues/27)) ([832f85a](https://github.com/abdellahjebar/listenin/commit/832f85a74b116d32ff631b82f2cac9879dc8942c)), closes [#26](https://github.com/abdellahjebar/listenin/issues/26)
* ADR 0006, authentification par session côté serveur ([#29](https://github.com/abdellahjebar/listenin/issues/29)) ([bd86214](https://github.com/abdellahjebar/listenin/commit/bd86214fb6f875f85409120b7bec42c194b2ee33)), closes [#28](https://github.com/abdellahjebar/listenin/issues/28)
* ADR 0007, outillage du contrat OpenAPI ([#30](https://github.com/abdellahjebar/listenin/issues/30)) ([34001a4](https://github.com/abdellahjebar/listenin/commit/34001a46b008c7f700dcba0f654c74c32baf67a3)), closes [#14](https://github.com/abdellahjebar/listenin/issues/14)
* ADR 0009, versionnage et publication (merge commit, SemVer, release-please) ([5c47fec](https://github.com/abdellahjebar/listenin/commit/5c47fec2a9b26adbe633688301b7832a23295c3c))
* document produit et user stories du palier 1 ([#18](https://github.com/abdellahjebar/listenin/issues/18)) ([45d3989](https://github.com/abdellahjebar/listenin/commit/45d398978510ca8c48b0d3f09b0092530fc26bb9)), closes [#15](https://github.com/abdellahjebar/listenin/issues/15)
* exigences de qualité et schémas d'architecture C4 ([#25](https://github.com/abdellahjebar/listenin/issues/25)) ([8d3fb7c](https://github.com/abdellahjebar/listenin/commit/8d3fb7ce698cc4aae93565e518dc5a1861438be8)), closes [#21](https://github.com/abdellahjebar/listenin/issues/21)
* gestion du travail (formulaires d'issue et ADR 0004) ([#13](https://github.com/abdellahjebar/listenin/issues/13)) ([a4c1f85](https://github.com/abdellahjebar/listenin/commit/a4c1f853dbb245bd620ea387dd6bdab642580534))
* méthodologie documentaire (ADR 0002) et contrat d'API OpenAPI (ADR 0003) ([2e7cb6a](https://github.com/abdellahjebar/listenin/commit/2e7cb6abe8c3dec291243107d5ae869f4ae1c2ef))
* modèle de domaine et matrice d'autorisation ([#20](https://github.com/abdellahjebar/listenin/issues/20)) ([834bcb1](https://github.com/abdellahjebar/listenin/commit/834bcb1150ea4fe26c64e892abb78402b97e3eab)), closes [#19](https://github.com/abdellahjebar/listenin/issues/19)
