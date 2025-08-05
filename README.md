# 🚀 Benevoclic API - Documentation de Déploiement

## 📋 Vue d'ensemble

Ce repository contient l'API Benevoclic avec une architecture de déploiement modulaire utilisant GitHub Actions, Docker, PM2, et un stack de monitoring complet.

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   GitHub Repo   │    │   GitHub Actions│    │   OVH VPS      │
│                 │    │                 │    │                 │
│ ┌─────────────┐ │    │ ┌─────────────┐ │    │ ┌─────────────┐ │
│ │ Source Code │ │───▶│ │ Workflows   │ │───▶│ │ Docker      │ │
│ │             │ │    │ │             │ │    │ │ Containers  │ │
│ └─────────────┘ │    │ └─────────────┘ │    │ └─────────────┘ │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │                       │
                                ▼                       ▼
                       ┌─────────────────┐    ┌─────────────────┐
                       │   Discord       │    │   Monitoring    │
                       │   Webhooks      │    │   Stack         │
                       │                 │    │                 │
                       │ ┌─────────────┐ │    │ ┌─────────────┐ │
                       │ │ Alerts      │ │    │ │ Prometheus  │ │
                       │ │ Notifications│ │    │ │ Grafana     │ │
                       │ └─────────────┘ │    │ │ Alertmanager│ │
                       └─────────────────┘    │ └─────────────┘ │
                                              └─────────────────┘
```

## 🎯 Services Déployés

| Service | Port | URL | Fonction |
|---------|------|-----|----------|
| **API Benevoclic** | 3000 | `http://IP_VPS:3000` | API principale |
| **Prometheus** | 9090 | `http://IP_VPS:9090` | Collecte métriques |
| **Alertmanager** | 9093 | `http://IP_VPS:9093` | Gestion alertes |
| **Grafana** | 3001 | `http://IP_VPS:3001` | Visualisation |
| **Node Exporter** | 9100 | `http://IP_VPS:9100` | Métriques système |

## 📖 Guides Principaux

### **🏗️ Architecture et Configuration**
- **[DEPLOYMENT_ARCHITECTURE.md](docs/DEPLOYMENT_ARCHITECTURE.md)** - Architecture détaillée du déploiement
- **[DEPLOYMENT_CONFIG.md](docs/DEPLOYMENT_CONFIG.md)** - Configuration centralisée
- **[WORKFLOWS_REFERENCE.md](docs/WORKFLOWS_REFERENCE.md)** - Guide des workflows GitHub Actions

### **🛠️ Maintenance et Production**
- **[PM2_PRODUCTION_GUIDE.md](docs/PM2_PRODUCTION_GUIDE.md)** - Guide complet PM2
- **[PRODUCTION_COMMANDS.md](docs/PRODUCTION_COMMANDS.md)** - Commandes de production
- **[PRODUCTION_MAINTENANCE.md](docs/PRODUCTION_MAINTENANCE.md)** - Maintenance production

### **📋 Versioning et Traçabilité**
- **[CHANGELOG.md](CHANGELOG.md)** - Journal des versions
- **[VERSIONING_GUIDE.md](VERSIONING_GUIDE.md)** - Guide de traçabilité des évolutions
- **[SCRIPTS_GUIDE.md](SCRIPTS_GUIDE.md)** - Guide des scripts de versioning

### **📚 Guides Spécifiques**
- **[DEPLOYMENT_GUIDE.md](docs/DEPLOYMENT_GUIDE.md)** - Guide de déploiement détaillé
- **[DEPLOYMENT_README.md](docs/DEPLOYMENT_README.md)** - Guide de déploiement rapide

## 🚀 Déploiement Rapide

### **Via GitHub Actions (Recommandé)**
1. Allez sur votre repository GitHub
2. Onglet **Actions** → **Deploy to OVH VPS**
3. Cliquez **Run workflow**
4. Le déploiement se fait automatiquement

### **Vérification Post-Déploiement**
```bash
# Se connecter au serveur
ssh debian@IP_VPS

# Vérifier les services
pm2 status
docker ps

# Vérifier la santé
curl http://IP_VPS:3000/health
curl http://IP_VPS:9090/-/healthy
curl http://IP_VPS:9093/-/healthy
```

## 🔧 Commandes Essentielles

### **PM2 (Gestion des Processus)**
```bash
# Voir le statut
pm2 status

# Redémarrer l'API
pm2 restart benevoclic-api

# Voir les logs
pm2 logs benevoclic-api --lines 20

# Monitoring en temps réel
pm2 monit
```

### **Docker (Conteneurs)**
```bash
# Voir les conteneurs
docker ps

# Redémarrer les services
docker-compose restart

# Voir les logs
docker logs benevoclic-api --tail 20
```

### **Monitoring**
```bash
# Vérifier les métriques
curl http://IP_VPS:9090/api/v1/targets

# Vérifier les alertes
curl http://IP_VPS:9093/api/v1/alerts

# Accéder à Grafana
# URL: http://IP_VPS:3001
# Login: admin / admin123
```

## 🚨 Alertes Configurées

### **Alertes API**
- **ServerDown** - Serveur arrêté
- **ServerUp** - Serveur redémarré
- **ServerInactive** - Inactivité détectée

### **Alertes Système**
- **SystemDown** - Système arrêté
- **SystemUp** - Système redémarré

### **Notifications Discord**
Toutes les alertes sont envoyées sur Discord avec :
- 🔴 **Rouge** pour les problèmes
- 🟢 **Vert** pour les résolutions
- 📊 Liens vers Alertmanager UI

## 📊 Monitoring Stack

### **Prometheus**
- Collecte des métriques
- Règles d'alerte
- Stockage des données

### **Alertmanager**
- Gestion des alertes
- Notifications Discord
- Déduplication

### **Grafana**
- Dashboards de monitoring
- Visualisation des métriques
- Alertes visuelles

### **Node Exporter**
- Métriques système
- CPU, mémoire, disque
- Métriques réseau

## 🔄 Workflows GitHub Actions

| Workflow | Déclenchement | Services | Utilisation |
|----------|---------------|----------|-------------|
| `deploy.yml` | Push main + Manual | Tous | Déploiement complet |
| `deploy-api.yml` | API files + Manual | API | Mise à jour API |
| `deploy-prometheus.yml` | Alert rules + Manual | Prometheus + Alertmanager | Monitoring |
| `deploy-alertmanager.yml` | Manual | Alertmanager | Alertes |
| `deploy-grafana.yml` | Grafana files + Manual | Grafana | Dashboards |
| `deploy-node-exporter.yml` | Manual | Node Exporter | Métriques système |

## 🛡️ Sécurité

### **Secrets GitHub Requis**
- `VPS_HOST` - IP du serveur
- `VPS_USERNAME` - Utilisateur SSH
- `OVH_SSH_KEY` - Clé SSH privée
- `DOCKERHUB_USERNAME` - Docker Hub
- `MONGODB_URL` - Base de données
- `FIREBASE_*` - Configuration Firebase
- `AWS_*` - Configuration AWS S3

## 📈 Métriques Disponibles

### **API Metrics**
- Requêtes HTTP par seconde
- Temps de réponse moyen
- Taux d'erreurs
- Utilisation mémoire/CPU

### **System Metrics**
- Utilisation CPU
- Utilisation mémoire
- Utilisation disque
- Métriques réseau

## 🚨 Dépannage

### **Problèmes Courants**
1. **API ne démarre pas** → Vérifier `pm2 logs benevoclic-api`
2. **Alertes ne fonctionnent pas** → Vérifier `docker logs alertmanager`
3. **Prometheus pas de données** → Vérifier les targets
4. **Discord notifications** → Vérifier le webhook

### **Commandes de Dépannage**
```bash
# Vérifier PM2
pm2 status
pm2 logs benevoclic-api

# Vérifier Docker
docker ps
docker logs benevoclic-api

# Vérifier les services
curl http://IP_VPS:3000/health
curl http://IP_VPS:9090/-/healthy
```

## 📞 Support

En cas de problème :
1. Vérifier les logs des services
2. Consulter les métriques Prometheus
3. Vérifier les alertes actives
4. Consulter la documentation détaillée

---

## 🎯 Avantages de cette Architecture

### **✅ Modularité**
- Déploiements indépendants par service
- Workflows GitHub Actions séparés
- Configuration centralisée

### **✅ Monitoring Complet**
- Métriques en temps réel
- Alertes automatiques
- Notifications Discord

### **✅ Maintenance Facile**
- Documentation complète
- Commandes PM2 et Docker
- Scripts de maintenance

### **✅ Scalabilité**
- Architecture modulaire
- Monitoring extensible
- Déploiements zero-downtime

**🚀 Votre infrastructure est prête pour la production !**

