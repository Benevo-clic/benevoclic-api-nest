# 📋 Changelog - Benevoclic API

Toutes les modifications notables de ce projet seront documentées dans ce fichier.

Le format est basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/),
et ce projet adhère au [Semantic Versioning](https://semver.org/lang/fr/).

## [Unreleased]
## [0.0.5] - 2025-08-04

### 🚀 Ajouté
- Release 0.0.5

### 🔧 Modifié
- Mise à jour de la version

---

## [0.0.4] - 2025-08-04

### 🚀 Ajouté
- Release 0.0.4

### 🔧 Modifié
- Mise à jour de la version

---

## [0.0.3] - 2025-08-04

### 🚀 Ajouté
- Release 0.0.3

### 🔧 Modifié
- Mise à jour de la version

---

## [0.0.2] - 2025-08-04

### 🚀 Ajouté
- Release 0.0.2

### 🔧 Modifié
- Mise à jour de la version

---


### 🚀 Ajouté
- Système de monitoring complet avec Prometheus, Grafana, Alertmanager
- Workflows GitHub Actions modulaires pour déploiement par service
- Documentation complète avec guides PM2 et maintenance production
- Alertes Discord automatisées avec notifications colorées
- Architecture de déploiement modulaire et scalable

### 🔧 Modifié
- Refactorisation de l'architecture de déploiement
- Amélioration du système d'alertes avec templates Discord
- Optimisation des workflows GitHub Actions

### 🐛 Corrigé
- Correction des erreurs de templates Alertmanager
- Résolution des problèmes de configuration Prometheus
- Correction des URLs hardcodées (remplacement par IP_VPS)

### 🔒 Sécurité
- Sécurisation des webhooks Discord via secrets GitHub
- Amélioration de la gestion des variables d'environnement

---

## [1.0.0] - 2024-01-XX

### 🚀 Ajouté
- **API Benevoclic** - API principale avec NestJS
- **Système de monitoring** - Prometheus, Grafana, Alertmanager
- **Déploiement automatisé** - GitHub Actions workflows
- **Alertes Discord** - Notifications en temps réel
- **Documentation complète** - Guides de déploiement et maintenance

### 📊 Monitoring
- **Prometheus** - Collecte et stockage des métriques
- **Grafana** - Visualisation des dashboards
- **Alertmanager** - Gestion des alertes et notifications
- **Node Exporter** - Métriques système

### 🔄 Workflows GitHub Actions
- `deploy-api.yml` - Déploiement de l'API
- `deploy-prometheus.yml` - Déploiement du monitoring
- `deploy-alertmanager.yml` - Déploiement des alertes
- `deploy-grafana.yml` - Déploiement des dashboards
- `deploy-node-exporter.yml` - Déploiement des métriques système

### 📚 Documentation
- **README.md** - Vue d'ensemble du projet
- **DEPLOYMENT_ARCHITECTURE.md** - Architecture détaillée
- **WORKFLOWS_REFERENCE.md** - Guide des workflows
- **DEPLOYMENT_CONFIG.md** - Configuration centralisée
- **PM2_PRODUCTION_GUIDE.md** - Guide PM2 complet
- **PRODUCTION_COMMANDS.md** - Commandes de production
- **PRODUCTION_MAINTENANCE.md** - Maintenance production

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

## 📊 Statistiques des Releases

| Version | Date | Fonctionnalités | Corrections | Breaking Changes |
|---------|------|-----------------|-------------|------------------|
| 1.0.0 | 2024-01-XX | 15 | 8 | 0 |
| Unreleased | - | 12 | 5 | 0 |

---

*Dernière mise à jour : 2024-01-XX* 