# 🚀 Architecture de Déploiement - Benevoclic

## 📋 Vue d'ensemble

Benevoclic utilise une architecture de déploiement moderne avec des workflows GitHub Actions modulaires, un monitoring complet et des alertes en temps réel.

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

## 📚 Documentation

### **📖 Guides Principaux**
- **[DEPLOYMENT_ARCHITECTURE.md](DEPLOYMENT_ARCHITECTURE.md)** - Architecture détaillée
- **[WORKFLOWS_REFERENCE.md](WORKFLOWS_REFERENCE.md)** - Guide des workflows
- **[DEPLOYMENT_CONFIG.md](DEPLOYMENT_CONFIG.md)** - Configuration centralisée
- **[PRODUCTION_MAINTENANCE.md](PRODUCTION_MAINTENANCE.md)** - Maintenance production

### **📋 Guides Spécialisés**
- **[DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)** - Guide de déploiement manuel
- **[DEPLOYMENT_README.md](DEPLOYMENT_README.md)** - Guide de déploiement rapide

## 🔄 Workflows GitHub Actions

### **Workflows Disponibles**

| Workflow | Déclenchement | Services | Description |
|----------|---------------|----------|-------------|
| `deploy.yml` | Push main + Manual | Tous | Déploiement complet |
| `deploy-api.yml` | API files + Manual | API | Mise à jour API |
| `deploy-prometheus.yml` | Alert rules + Manual | Prometheus + Alertmanager | Monitoring |
| `deploy-alertmanager.yml` | Manual | Alertmanager | Alertes |
| `deploy-grafana.yml` | Grafana files + Manual | Grafana | Dashboards |
| `deploy-node-exporter.yml` | Manual | Node Exporter | Métriques système |

### **Déclenchement Rapide**
```bash

# Déploiement API seulement
gh workflow run deploy-api.yml

# Déploiement monitoring
gh workflow run deploy-prometheus.yml

# Déploiement alertes
gh workflow run deploy-alertmanager.yml
```

## 🐳 Services Docker

### **Services Déployés**

#### **API Benevoclic**
- **Port :** 3000
- **Health :** http://IP_VPS:3000/health
- **Métriques :** http://IP_VPS:3000/metrics

#### **Prometheus**
- **Port :** 9090
- **URL :** http://IP_VPS:9090
- **Fonction :** Collecte et stockage des métriques

#### **Alertmanager**
- **Port :** 9093
- **URL :** http://IP_VPS:9093
- **Fonction :** Gestion des alertes et notifications Discord

#### **Grafana**
- **Port :** 3001
- **URL :** http://IP_VPS:3001
- **Login :** admin / admin123
- **Fonction :** Visualisation des métriques

#### **Node Exporter**
- **Port :** 9100
- **Fonction :** Métriques système (CPU, mémoire, disque)

## 🚨 Système d'Alertes

### **Alertes Configurées**

#### **Alertes API :**
- **ServerDown** - API inaccessible (🔴 Rouge)
- **ServerUp** - API rétablie (🟢 Vert)
- **ServerInactive** - API inactif (⚠️ Orange)

#### **Alertes Système :**
- **SystemDown** - Node Exporter inaccessible
- **SystemUp** - Node Exporter rétabli

### **Notifications Discord**
- **Webhook Discord** configuré
- **Templates personnalisés** pour chaque type d'alerte
- **Couleurs différenciées** pour identification rapide
- **Liens directs** vers les interfaces de monitoring

## 🔧 Configuration

### **Secrets GitHub Requis**

#### **Connexion VPS :**
```bash
VPS_HOST          # IP du serveur
VPS_USERNAME      # Utilisateur SSH
OVH_SSH_KEY       # Clé SSH privée
```

#### **Docker Hub :**
```bash
DOCKERHUB_USERNAME # Nom d'utilisateur Docker Hub
```

#### **Base de données :**
```bash
MONGODB_URL       # URL de connexion MongoDB
MONGODB_DB_NAME   # Nom de la base de données
```

#### **Firebase :**
```bash
FIREBASE_CLIENT_EMAIL    # Email du service Firebase
FIREBASE_PRIVATE_KEY     # Clé privée Firebase
FIREBASE_PROJECT_ID      # ID du projet Firebase
FIREBASE_API_KEY         # Clé API Firebase
```

#### **AWS S3 :**
```bash
AWS_ACCESS_KEY_ID       # Clé d'accès AWS
AWS_SECRET_ACCESS_KEY   # Clé secrète AWS
AWS_BUCKET_NAME         # Nom du bucket S3
AWS_REGION              # Région AWS
```

## 🛠️ Commandes de Maintenance

### **Vérification Rapide**
```bash
# État des services
docker ps

# Health checks
curl http://IP_VPS:3000/health
curl http://IP_VPS:9090/-/healthy
curl http://IP_VPS:9093/-/healthy

# Logs récents
docker logs benevoclic-api --tail 10
docker logs prometheus --tail 10
docker logs alertmanager --tail 10
```

### **Maintenance Avancée**
```bash
# Redémarrer un service
docker restart <service-name>

# Vérifier les métriques
curl http://IP_VPS:9090/api/v1/targets

# Vérifier les alertes
curl http://IP_VPS:9093/api/v1/alerts

# Nettoyer Docker
docker system prune -f
```

## 📊 Monitoring et Métriques

### **Prometheus Targets**
- **benevoclic-api:3000** - Métriques API
- **node-exporter:9100** - Métriques système
- **prometheus:9090** - Métriques Prometheus

### **Grafana Dashboards**
- **API Metrics** - Métriques de l'application
- **System Metrics** - Métriques système
- **Alerts Overview** - Vue d'ensemble des alertes

### **Métriques Disponibles**
- **HTTP Requests** - Nombre de requêtes par seconde
- **Response Time** - Temps de réponse moyen
- **Error Rate** - Taux d'erreurs
- **CPU Usage** - Utilisation CPU
- **Memory Usage** - Utilisation mémoire
- **Disk Usage** - Utilisation disque

## 🔄 Processus de Déploiement

### **Déploiement Standard**
1. **Modifier** le code
2. **Pousser** sur la branche main
3. **Attendre** le déploiement automatique
4. **Vérifier** les services
5. **Tester** les fonctionnalités

### **Déploiement d'Urgence**
1. **Identifier** le problème
2. **Déclencher** le workflow approprié
3. **Surveiller** les logs
4. **Vérifier** la résolution
5. **Documenter** l'incident

## 🆘 Dépannage

### **Problèmes Courants**

#### **Service ne démarre pas :**
```bash
# Vérifier les logs
docker logs <service-name>

# Vérifier la configuration
docker exec <service-name> cat /etc/config.yml

# Redémarrer le service
docker restart <service-name>
```

#### **Alertes ne fonctionnent pas :**
```bash
# Vérifier Alertmanager
curl http://IP_VPS:9093/api/v1/status

# Vérifier les règles Prometheus
curl http://IP_VPS:9090/api/v1/rules

# Tester le webhook Discord
curl -X POST -H "Content-Type: application/json" \
  -d '{"content":"Test"}' \
  <webhook-url>
```

#### **Métriques manquantes :**
```bash
# Vérifier les targets
curl http://IP_VPS:9090/api/v1/targets

# Vérifier les métriques
curl http://IP_VPS:3000/metrics

# Redémarrer Prometheus
docker restart prometheus
```

## 📈 Avantages de cette Architecture

### **✅ Modularité**
- Déploiements indépendants par service
- Maintenance simplifiée
- Tests ciblés

### **✅ Fiabilité**
- Rollback facile
- Monitoring intégré
- Alertes en temps réel

### **✅ Scalabilité**
- Ajout facile de nouveaux services
- Configuration centralisée
- Workflows réutilisables

### **✅ Observabilité**
- Métriques complètes
- Logs centralisés
- Dashboards visuels

## 📝 Bonnes Pratiques

### **Avant un Déploiement**
- ✅ Vérifier les secrets GitHub
- ✅ Tester en local si possible
- ✅ Préparer un plan de rollback
- ✅ Notifier l'équipe

### **Pendant un Déploiement**
- ✅ Surveiller les logs en temps réel
- ✅ Vérifier les métriques
- ✅ Tester les fonctionnalités critiques
- ✅ Valider les alertes

### **Après un Déploiement**
- ✅ Vérifier tous les services
- ✅ Tester les alertes
- ✅ Valider les dashboards
- ✅ Documenter les changements

## 🎯 Quick Start

### **Déploiement Initial**
1. **Configurer** les secrets GitHub
2. **Déclencher** le workflow `deploy.yml`
3. **Attendre** le déploiement complet
4. **Vérifier** tous les services
5. **Tester** les alertes Discord

### **Mise à jour API**
1. **Modifier** le code de l'API
2. **Pousser** sur main
3. **Attendre** le déploiement automatique
4. **Vérifier** l'API

### **Modification des Alertes**
1. **Modifier** `alert_rules.yml`
2. **Déclencher** `deploy-prometheus.yml`
3. **Vérifier** les nouvelles alertes

---

## 🚀 Conclusion

Cette architecture de déploiement offre :
- **Flexibilité** avec des workflows modulaires
- **Fiabilité** avec monitoring intégré
- **Observabilité** avec métriques complètes
- **Maintenabilité** avec documentation détaillée

**🎉 Votre infrastructure est prête pour la production !**

---

## 📞 Support

En cas de problème :
1. Consulter la documentation appropriée
2. Vérifier les logs des services
3. Consulter les métriques Prometheus
4. Vérifier les alertes actives
5. Contacter l'équipe de développement

**📚 Documentation complète disponible dans les fichiers markdown associés.** 