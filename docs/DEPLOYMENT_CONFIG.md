# ⚙️ Configuration de Déploiement - Benevoclic

## 📋 Configuration Centralisée

Ce fichier centralise toutes les configurations de déploiement pour faciliter la maintenance et les modifications.

## 🌐 Configuration Réseau

### **Adresses IP et Ports**
```yaml
# Configuration VPS
VPS_IP: "IP_VPS"                  # IP du serveur de production
VPS_USERNAME: "debian"            # Utilisateur SSH
VPS_SSH_PORT: 22                  # Port SSH

# Services et Ports
API_PORT: 3000                    # Port de l'API Benevoclic
PROMETHEUS_PORT: 9090             # Port Prometheus
ALERTMANAGER_PORT: 9093           # Port Alertmanager
GRAFANA_PORT: 3001                # Port Grafana
NODE_EXPORTER_PORT: 9100          # Port Node Exporter

# URLs des Services
API_URL: "http://IP_VPS:3000"
PROMETHEUS_URL: "http://IP_VPS:9090"
ALERTMANAGER_URL: "http://IP_VPS:9093"
GRAFANA_URL: "http://IP_VPS:3001"
NODE_EXPORTER_URL: "http://IP_VPS:9100"
```

## 🔧 Configuration Docker

### **Images Docker**
```yaml
# Images utilisées
API_IMAGE: "${DOCKERHUB_USERNAME}/benevoclic-api:latest"
PROMETHEUS_IMAGE: "prom/prometheus:latest"
ALERTMANAGER_IMAGE: "prom/alertmanager:latest"
GRAFANA_IMAGE: "grafana/grafana:latest"
NODE_EXPORTER_IMAGE: "prom/node-exporter:latest"

# Réseau Docker
NETWORK_NAME: "benevoclic-network"
```

### **Volumes et Persistance**
```yaml
# Volumes Docker
PROMETHEUS_DATA: "prometheus_data"
GRAFANA_DATA: "grafana_data"
ALERTMANAGER_DATA: "alertmanager_data"

# Rétention des données
PROMETHEUS_RETENTION: "200h"
```

## 🚨 Configuration des Alertes

### **Webhook Discord**
```yaml
# Webhook Discord
DISCORD_WEBHOOK_URL: "$WEBHOOK_URL"

# Templates Discord
DISCORD_TEMPLATES:
  SERVER_DOWN: "🔴 **SERVEUR TOMBÉ - Benevoclic**"
  SERVER_UP: "🟢 **SERVEUR RÉTABLI - Benevoclic**"
  SERVER_INACTIVE: "⚠️ **SERVEUR INACTIF - Benevoclic**"
```

### **Règles d'Alerte**
```yaml
# Seuils d'alerte
ALERT_THRESHOLDS:
  API_DOWN_TIMEOUT: "30s"
  API_INACTIVE_TIMEOUT: "5m"
  SYSTEM_DOWN_TIMEOUT: "30s"
  HIGH_CPU_USAGE: "80%"
  HIGH_MEMORY_USAGE: "85%"

# Intervalles de répétition
ALERT_REPEAT_INTERVALS:
  CRITICAL: "30m"
  WARNING: "1h"
  INFO: "2h"
```

## 📊 Configuration Monitoring

### **Prometheus Configuration**
```yaml
# Intervalles de scraping
SCRAPE_INTERVALS:
  PROMETHEUS: "15s"
  API: "10s"
  NODE_EXPORTER: "15s"

# Timeouts
SCRAPE_TIMEOUTS:
  API: "5s"
  NODE_EXPORTER: "10s"
```

### **Grafana Configuration**
```yaml
# Credentials Grafana
GRAFANA_ADMIN_USER: "admin"
GRAFANA_ADMIN_PASSWORD: "admin123"
GRAFANA_ALLOW_SIGNUP: false

# Dashboards
GRAFANA_DASHBOARDS:
  - "API Metrics"
  - "System Metrics"
  - "Alerts Overview"
```

## 🔐 Configuration Sécurité

### **Variables d'Environnement**
```yaml
# Variables d'environnement API
API_ENV_VARS:
  NODE_ENV: "production"
  PORT: 3000
  MONGODB_URL: "${MONGODB_URL}"
  MONGODB_DB_NAME: "benevoclic"
  FIREBASE_CLIENT_EMAIL: "${FIREBASE_CLIENT_EMAIL}"
  FIREBASE_PRIVATE_KEY: "${FIREBASE_PRIVATE_KEY}"
  FIREBASE_PROJECT_ID: "${FIREBASE_PROJECT_ID}"
  FIREBASE_API_KEY: "${FIREBASE_API_KEY}"
  AWS_ACCESS_KEY_ID: "${AWS_ACCESS_KEY_ID}"
  AWS_SECRET_ACCESS_KEY: "${AWS_SECRET_ACCESS_KEY}"
  AWS_BUCKET_NAME: "${AWS_BUCKET_NAME}"
  AWS_REGION: "${AWS_REGION}"
```

### **Health Checks**
```yaml
# Configuration des health checks
HEALTH_CHECKS:
  API:
    TEST: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:3000/health"]
    INTERVAL: "30s"
    TIMEOUT: "3s"
    RETRIES: 3
    START_PERIOD: "10s"
  
  PROMETHEUS:
    TEST: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:9090/-/healthy"]
    INTERVAL: "30s"
    TIMEOUT: "3s"
    RETRIES: 3
    START_PERIOD: "10s"
```

## 🔄 Configuration Déploiement

### **Workflows GitHub Actions**
```yaml
# Déclenchement des workflows
WORKFLOW_TRIGGERS:
  DEPLOY_COMPLETE:
    - "push"
    - "workflow_dispatch"
    BRANCHES: ["main"]
  
  DEPLOY_API:
    - "push"
    - "workflow_dispatch"
    BRANCHES: ["main"]
    PATHS:
      - "src/**"
      - "package.json"
      - "Dockerfile"
  
  DEPLOY_MONITORING:
    - "push"
    - "workflow_dispatch"
    BRANCHES: ["main"]
    PATHS:
      - "alert_rules.yml"
      - "prometheus.yml"
  
  DEPLOY_ALERTMANAGER:
    - "workflow_dispatch"
  
  DEPLOY_GRAFANA:
    - "push"
    - "workflow_dispatch"
    BRANCHES: ["main"]
    PATHS:
      - "grafana/**"
  
  DEPLOY_NODE_EXPORTER:
    - "workflow_dispatch"
```

### **Secrets GitHub Requis**
```yaml
# Secrets de connexion
CONNECTION_SECRETS:
  - "VPS_HOST"
  - "VPS_USERNAME"
  - "OVH_SSH_KEY"

# Secrets Docker
DOCKER_SECRETS:
  - "DOCKERHUB_USERNAME"

# Secrets Base de données
DATABASE_SECRETS:
  - "MONGODB_URL"
  - "MONGODB_DB_NAME"

# Secrets Firebase
FIREBASE_SECRETS:
  - "FIREBASE_CLIENT_EMAIL"
  - "FIREBASE_PRIVATE_KEY"
  - "FIREBASE_PROJECT_ID"
  - "FIREBASE_API_KEY"

# Secrets AWS
AWS_SECRETS:
  - "AWS_ACCESS_KEY_ID"
  - "AWS_SECRET_ACCESS_KEY"
  - "AWS_BUCKET_NAME"
  - "AWS_REGION"
```

## 📝 Configuration Logs

### **Niveaux de Log**
```yaml
# Configuration des logs
LOG_LEVELS:
  API: "info"
  PROMETHEUS: "info"
  ALERTMANAGER: "info"
  GRAFANA: "info"

# Rotation des logs
LOG_ROTATION:
  MAX_SIZE: "100m"
  MAX_FILES: 3
  COMPRESS: true
```

## 🛠️ Configuration Maintenance

### **Commandes de Maintenance**
```yaml
# Commandes de vérification
VERIFICATION_COMMANDS:
  SERVICES: "docker ps"
  API_HEALTH: "curl http://IP_VPS:3000/health"
  PROMETHEUS_HEALTH: "curl http://IP_VPS:9090/-/healthy"
  ALERTMANAGER_HEALTH: "curl http://IP_VPS:9093/-/healthy"

# Commandes de logs
LOG_COMMANDS:
  API: "docker logs benevoclic-api -f"
  PROMETHEUS: "docker logs prometheus -f"
  ALERTMANAGER: "docker logs alertmanager -f"
  GRAFANA: "docker logs grafana -f"
```

### **Intervalles de Maintenance**
```yaml
# Intervalles de maintenance
MAINTENANCE_INTERVALS:
  LOG_CLEANUP: "7d"
  IMAGE_CLEANUP: "30d"
  VOLUME_BACKUP: "1d"
  CONFIG_BACKUP: "1d"
```

## 🔧 Utilisation de la Configuration

### **Modification de l'IP**
Pour changer l'IP du serveur, modifier :
```yaml
VPS_IP: "nouvelle.IP_VPS"
```

### **Modification des Ports**
Pour changer les ports, modifier :
```yaml
API_PORT: 3001                    # Nouveau port API
PROMETHEUS_PORT: 9091             # Nouveau port Prometheus
```

### **Modification des Alertes**
Pour changer les seuils d'alerte :
```yaml
ALERT_THRESHOLDS:
  HIGH_CPU_USAGE: "90%"           # Nouveau seuil CPU
  HIGH_MEMORY_USAGE: "90%"        # Nouveau seuil mémoire
```

## 📋 Checklist de Configuration

### **Avant Déploiement**
- [ ] Vérifier tous les secrets GitHub
- [ ] Tester les configurations en local
- [ ] Valider les URLs et ports
- [ ] Vérifier les webhooks Discord

### **Après Déploiement**
- [ ] Vérifier tous les services
- [ ] Tester les alertes
- [ ] Valider les dashboards
- [ ] Documenter les changements

---

## 🎯 Conclusion

Cette configuration centralisée permet :
- **Maintenance simplifiée** avec un seul point de modification
- **Cohérence** entre tous les services
- **Flexibilité** pour les changements
- **Documentation** claire des paramètres

**⚙️ Configuration optimisée pour la production !** 