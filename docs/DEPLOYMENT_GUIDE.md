# 🚀 Guide de Déploiement - Benevoclic API avec Monitoring

## 📋 Résumé des Corrections Appliquées

### ✅ **Problèmes corrigés :**

1. **Prometheus** : Supprimé le `rule_files` dupliqué dans `prometheus.yml`
2. **Réseau Docker** : Corrigé `docker-compose.monitoring.yml` pour utiliser `external: true`
3. **Targets** : Corrigé les adresses de `localhost` vers les noms de conteneurs
4. **Workflow GitHub** : Ajouté la création automatique du réseau

## 🔧 **Déploiement Automatique (Recommandé)**

### **Via GitHub Actions :**
1. Allez sur votre repository GitHub
2. Onglet **Actions** → **Deploy to OVH VPS**
3. Cliquez **Run workflow**
4. Le déploiement se fait automatiquement avec toutes les corrections

## 🛠️ **Déploiement Manuel (Si nécessaire)**

### **Étape 1: Préparer le VPS**
```bash
# Se connecter au VPS
ssh debian@IP_VPS

# Créer le répertoire
mkdir -p ~/benevoclic
cd ~/benevoclic
```

### **Étape 2: Créer les fichiers de configuration**

#### **docker-compose.yml**
```yaml
services:
  api:
    image: votre-username/benevoclic-api:latest
    container_name: benevoclic-api
    restart: always
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: production
      PORT: 3000
      MONGODB_URL: ${MONGODB_URL}
      MONGODB_DB_NAME: benevoclic
      FIREBASE_CLIENT_EMAIL: ${FIREBASE_CLIENT_EMAIL}
      FIREBASE_PRIVATE_KEY: ${FIREBASE_PRIVATE_KEY}
      FIREBASE_PROJECT_ID: ${FIREBASE_PROJECT_ID}
      FIREBASE_API_KEY: ${FIREBASE_API_KEY}
      AWS_ACCESS_KEY_ID: ${AWS_ACCESS_KEY_ID}
      AWS_SECRET_ACCESS_KEY: ${AWS_SECRET_ACCESS_KEY}
      AWS_BUCKET_NAME: ${AWS_BUCKET_NAME}
      AWS_REGION: ${AWS_REGION}
    volumes:
      - ./logs:/app/logs
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    networks:
      - benevoclic-network

networks:
  benevoclic-network:
    driver: bridge
```

#### **prometheus.yml**
```yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  - "alert_rules.yml"

scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  - job_name: 'benevoclic-api'
    static_configs:
      - targets: ['benevoclic-api:3000']
    metrics_path: '/metrics'
    scrape_interval: 10s
    scrape_timeout: 5s
    
    relabel_configs:
      - source_labels: [__address__]
        target_label: instance
        regex: '(.+)'
        replacement: '${1}'
      - source_labels: [__address__]
        target_label: service
        regex: '(.+)'
        replacement: 'benevoclic-api'

  - job_name: 'node-exporter'
    static_configs:
      - targets: ['node-exporter:9100']
    scrape_interval: 15s

alerting:
  alertmanagers:
    - static_configs:
        - targets:
```

#### **docker-compose.monitoring.yml**
```yaml
services:
  prometheus:
    image: prom/prometheus:latest
    container_name: prometheus
    restart: always
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--web.console.libraries=/etc/prometheus/console_libraries'
      - '--web.console.templates=/etc/prometheus/consoles'
      - '--storage.tsdb.retention.time=200h'
      - '--web.enable-lifecycle'
    networks:
      - benevoclic-network

  grafana:
    image: grafana/grafana:latest
    container_name: grafana
    restart: always
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_USER=admin
      - GF_SECURITY_ADMIN_PASSWORD=admin123
      - GF_USERS_ALLOW_SIGN_UP=false
    volumes:
      - grafana_data:/var/lib/grafana
      - ./grafana/dashboards:/etc/grafana/provisioning/dashboards
      - ./grafana/datasources:/etc/grafana/provisioning/datasources
    networks:
      - benevoclic-network

  node-exporter:
    image: prom/node-exporter:latest
    container_name: node-exporter
    restart: always
    ports:
      - "9100:9100"
    volumes:
      - /proc:/host/proc:ro
      - /sys:/host/sys:ro
      - /:/rootfs:ro
    command:
      - '--path.procfs=/host/proc'
      - '--path.rootfs=/rootfs'
      - '--path.sysfs=/host/sys'
      - '--collector.filesystem.mount-points-exclude=^/(sys|proc|dev|host|etc)(\$\$|/)'
    networks:
      - benevoclic-network

volumes:
  prometheus_data:
  grafana_data:

networks:
  benevoclic-network:
    external: true
```

### **Étape 3: Déployer**
```bash
# Créer le réseau
docker network create benevoclic-network

# Déployer l'API
docker compose up -d

# Déployer le monitoring
docker compose -f docker-compose.monitoring.yml up -d
```

## 🔍 **Vérification**

### **Script de test automatique :**
```bash
# Copier le script de test
curl -o test-monitoring.sh https://raw.githubusercontent.com/votre-repo/benevoclic-api-nest/main/scripts/test-monitoring.sh
chmod +x test-monitoring.sh
./test-monitoring.sh
```

### **Vérifications manuelles :**

#### **1. Conteneurs en cours d'exécution :**
```bash
docker ps
```

#### **2. API fonctionnelle :**
```bash
curl http://localhost:3000/health
curl http://localhost:3000/metrics
```

#### **3. Prometheus accessible :**
```bash
curl http://localhost:9090/api/v1/targets
```

#### **4. Grafana accessible :**
```bash
curl http://localhost:3001/api/health
```

## 📊 **Accès aux Services**

- **Grafana** : http://IP_VPS:3001 (admin/admin123)
- **Prometheus** : http://IP_VPS:9090
- **API** : http://IP_VPS:3000

## 🚨 **Dépannage**

### **Problème : "No data" dans Grafana**
```bash
# Vérifier les targets Prometheus
curl http://localhost:9090/api/v1/targets

# Vérifier les métriques
curl "http://localhost:9090/api/v1/query?query=up"
```

### **Problème : Prometheus ne démarre pas**
```bash
# Vérifier la configuration
docker logs prometheus

# Vérifier le fichier prometheus.yml
cat prometheus.yml
```

### **Problème : Réseau Docker**
```bash
# Recréer le réseau
docker network rm benevoclic-network
docker network create benevoclic-network

# Redémarrer les services
docker compose down
docker compose -f docker-compose.monitoring.yml down
docker compose up -d
docker compose -f docker-compose.monitoring.yml up -d
```

## 📝 **Logs**

### **Voir les logs en temps réel :**
```bash
# API
docker logs -f benevoclic-api

# Prometheus
docker logs -f prometheus

# Grafana
docker logs -f grafana
```

### **Logs des 10 dernières lignes :**
```bash
docker logs --tail 10 benevoclic-api
docker logs --tail 10 prometheus
docker logs --tail 10 grafana
```

## 🔄 **Mise à jour**

### **Via GitHub Actions (Recommandé) :**
1. Push sur la branche main
2. Déclencher le workflow de déploiement

### **Manuel :**
```bash
# Arrêter les services
docker compose down
docker compose -f docker-compose.monitoring.yml down

# Pull les nouvelles images
docker compose pull

# Redémarrer
docker compose up -d
docker compose -f docker-compose.monitoring.yml up -d
```

## ✅ **Validation finale**

Après déploiement, vous devriez voir :

1. ✅ **3 conteneurs** en cours d'exécution (API, Prometheus, Grafana)
2. ✅ **Targets UP** dans Prometheus
3. ✅ **Données** dans Grafana
4. ✅ **Métriques** collectées depuis l'API

---

**🎉 Votre monitoring est maintenant opérationnel !** 