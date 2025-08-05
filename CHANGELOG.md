## [0.2.0] - 2025-08-05

### 🚀 Ajouté
- delete VERSIONING FILE

---

## [0.1.0] - 2025-08-04

### 🚀 Ajouté
- ajout de la fonctionnalité de test
- ajout de la fonctionnalité de recherche avancée
- streamline release process with unified create-release job and improved deployment steps (#84)
- refactor release workflow to streamline versioning and changelog updates
- refactor release workflow to streamline versioning and changelog updates (#82)

### 🐛 Corrigé
- correct release workflow syntax errors

### 📚 Documentation
- update CHANGELOG for version 0.0.5
- update CHANGELOG for version 0.0.5

---

# 📋 Changelog - Benevoclic API

Toutes les modifications notables de ce projet seront documentées dans ce fichier.

Le format est basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/),
et ce projet adhère au [Semantic Versioning](https://semver.org/lang/fr/).

## [Unreleased]

### 🚀 Ajouté
- Fonctionnalités en cours de développement

---

## [0.2.0] - 2025-08-05

### 🚀 Ajouté

---

## [0.1.0] - 2025-08-04

### 🚀 Ajouté
- ajout de la fonctionnalité de recherche avancée
- ajout de la fonctionnalité de test
- refactor release workflow to streamline versioning and changelog updates
- streamline release process with unified create-release job and improved deployment steps

### 🐛 Corrigé
- correct release workflow syntax errors

---

## [0.0.5] - 2025-08-04

### 🚀 Ajouté
- ajout de la fonctionnalité de recherche avancée
- ajout de la fonctionnalité de test
- enhance release workflow with automatic version bumping and deployment checks
- refactor release workflow to streamline versioning and changelog updates
- streamline release process with unified create-release job and improved deployment steps

### 🐛 Corrigé
- correct release workflow syntax errors

---

## [0.0.4] - 2025-08-04

### 🚀 Ajouté
- ajout de la fonctionnalité de recherche avancée
- ajout de la fonctionnalité de test
- enhance release workflow with automatic version bumping and deployment checks
- refactor release workflow to streamline versioning and changelog updates
- streamline release process with unified create-release job and improved deployment steps
- update release workflow to use secret IP for health checks and monitoring links

### 🐛 Corrigé
- correct release workflow syntax errors

---

## [0.0.3] - 2025-08-04

### 🚀 Ajouté
- ajout de la fonctionnalité de recherche avancée
- ajout de la fonctionnalité de test
- enhance release workflow with automatic version bumping and deployment checks
- enhance release workflow with corrected job triggers and dependencies
- refactor release workflow to streamline versioning and changelog updates
- streamline release process with unified create-release job and improved deployment steps
- update release workflow to use secret IP for health checks and monitoring links

### 🐛 Corrigé
- correct release workflow syntax errors

---

## [0.0.2] - 2025-08-04

### 🚀 Ajouté
- add Alertmanager configuration and update alert rules for API monitoring
- add Alertmanager links to deployment configuration for improved monitoring access
- add auth google
- add endpoints to retrieve the number of associations and volunteers
- add endpoint to retrieve favorite announcements by volunteer ID with error handling
- add find by email
- add health check endpoint and integrate PM2 for process management
- add logging and error handling for fetching associations by volunteer
- add logging for announcement filtering criteria
- add logging for fetching announcement by ID
- add mongo collection
- add monitoring scripts and update alerting configurations for BenevoClic
- add Prometheus monitoring integration with custom metrics and Grafana dashboards
- add public access to refreshAuth endpoint
- add release workflow testing script and enhance release.yml configuration
- add rules
- add test volunteer
- add traffic generation scripts and update Prometheus monitoring integration
- add variable is completed
- ajout de la fonctionnalité de recherche avancée
- ajout de la fonctionnalité de test
- announcement
- announcement controller test
- auth email verified
- change refreshAuth endpoint to use body for refreshToken
- change type create announcement
- cicd
- config ovh
- correct spelling of Benevoclic in dashboard titles and deployment scripts
- cors
- create announcement
- empty tableau
- endPoint
- enhance logging for fetching associations and update volunteer list endpoint
- enhance logging for Firebase authentication process and improve error handling
- enhance monitoring setup with Alertmanager integration and Discord notifications
- enhance monitoring setup with new alert rules and Discord notifications for server status
- enhance release workflow with automatic version bumping and deployment checks
- enhance release workflow with corrected job triggers and dependencies
- env
- feat:association controller test
- filter
- filter volunteer announcement
- get current user without email or id
- get more info user
- get user
- handle user registration for existing emails
- id
- import volunteer
- improve error handling in signInWithEmailAndPassword method for Firebase authentication
- login asso and volunteer
- modified body of user
- modify register
- mongo config
- refactor release workflow to streamline versioning and changelog updates
- remove participant
- rename volunteer properties for consistency in association management
- return favorites of volunteer
- set global prefix for API routes
- simplify Alertmanager configuration and update filesystem mount points exclusion in Docker Compose
- streamline release process with unified create-release job and improved deployment steps
- test association done
- test user
- update API endpoints for announcements and associations with more descriptive paths
- update connection
- update deployment configuration for MongoDB and AWS integration
- update Discord alert messages with new status icons for server notifications
- update Docker Compose configuration and enhance deployment script
- update Grafana deployment with secret management and add new metrics dashboards
- update network configuration in Docker setup and add network fix script
- update production environment variables for JWT and AWS S3
- update refresh token
- update release workflow to use secret IP for health checks and monitoring links
- update remove user

### 🐛 Corrigé
- add photo number
- body update connected
- change global API prefix from 'api' to 'swagger'
- correct release workflow syntax errors
- cover
- date last change
- deploy cide
- docker
- endpoint name
- error connexion
- filed volunteer
- not create user if user already exists
- pipe
- refresh token
- register volunteer association
- release
- remove unused services from announcement module
- remove user
- rollback user auth
- test association
- update firebase private key handling to replace escaped newlines
- update refreshAuth endpoint to accept body for refreshToken
- user
- user register email verified
- value
- verify if email existe
- workflow

### ♻️ Refactorisation
- favorites announcement create

### 🔧 Maintenance
- type location

---

## [0.0.1] - 2025-01-31

### 🚀 Ajouté

---


## Format du Changelog

### Types de modifications

- **🚀 Ajouté** - Nouvelles fonctionnalités
- **🔧 Modifié** - Changements dans les fonctionnalités existantes
- **🐛 Corrigé** - Corrections de bugs
- **🔒 Sécurité** - Corrections de vulnérabilités
- **📚 Documentation** - Mises à jour de la documentation
- **♻️ Refactorisation** - Améliorations du code sans changement de fonctionnalité
- **⚡ Performance** - Améliorations de performance
- **🧪 Tests** - Ajout ou modification de tests
- **🔧 Configuration** - Changements de configuration
- **📦 Dépendances** - Mises à jour de dépendances

### Structure d'une entrée

```markdown
## [Version] - YYYY-MM-DD

### 🚀 Ajouté
- Nouvelle fonctionnalité A
- Nouvelle fonctionnalité B

### 🔧 Modifié
- Amélioration de la fonctionnalité X
- Changement dans la configuration Y

### 🐛 Corrigé
- Correction du bug Z
- Résolution du problème W
```

---

## 🎯 Politique de Versioning

### Semantic Versioning (SemVer)

Ce projet suit le [Semantic Versioning](https://semver.org/lang/fr/) :

- **MAJOR.MINOR.PATCH**
  - **MAJOR** : Changements incompatibles avec les versions précédentes
  - **MINOR** : Nouvelles fonctionnalités compatibles
  - **PATCH** : Corrections de bugs compatibles

### Exemples de versions

- `1.0.0` - Première version stable
- `1.1.0` - Nouvelles fonctionnalités
- `1.1.1` - Corrections de bugs
- `2.0.0` - Changements majeurs incompatibles

---

## 📝 Processus de Release

### 1. Développement
- Toutes les modifications sont documentées dans `[Unreleased]`
- Utilisation de commits conventionnels
- Tests automatisés avant chaque release

### 2. Préparation de la Release
- Mise à jour du CHANGELOG.md
- Création d'un tag Git
- Génération des release notes GitHub

### 3. Déploiement
- Déclenchement automatique des workflows
- Tests de déploiement
- Vérification post-déploiement

### 4. Documentation
- Mise à jour de la documentation
- Communication des changements
- Formation de l'équipe si nécessaire

---

## 🔗 Liens utiles

- [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/)
- [Semantic Versioning](https://semver.org/lang/fr/)
- [Conventional Commits](https://www.conventionalcommits.org/fr/)
- [GitHub Releases](https://docs.github.com/fr/repositories/releasing-projects-on-github)

---

*Dernière mise à jour : $(date +%Y-%m-%d)*
