# 🏗️ Architecture de Déploiement - Benevoclic

## 📋 Vue d'ensemble

Benevoclic utilise une architecture de déploiement modulaire avec des workflows GitHub Actions séparés pour chaque service, permettant des déploiements indépendants et ciblés.

## 🎯 Stratégie de Déploiement

### **Architecture Modulaire**
- **Déploiements indépendants** par service
- **Workflows séparés** pour chaque composant
- **Monitoring intégré** avec alertes Discord
- **Configuration centralisée** via GitHub Secrets

### **Services Déployés**
1. **API Benevoclic** - Application principale
2. **Prometheus** - Collecte de métriques
3. **Alertmanager** - Gestion des alertes
4. **Grafana** - Visualisation des données
5. **Node Exporter** - Métriques système

## 🔄 Workflows GitHub Actions

### **1. deploy.yml - Déploiement Complet**
```yaml
# Déploiement de tous les services
# Déclenchement : push sur main OU workflow_dispatch
# Services : API + Monitoring complet
```

**Utilisation :**
- Déploiement initial
- Mise à jour complète
- Récupération après incident

### **2. deploy-api.yml - API Seulement**
```yaml
# Déploiement de l'API Benevoclic
# Déclenchement : modification des fichiers API
# Services : API uniquement
```

**Utilisation :**
- Mise à jour de l'application
- Correction de bugs
- Déploiement rapide

### **3. deploy-prometheus.yml - Monitoring**
```yaml
# Déploiement Prometheus + Alertmanager
# Déclenchement : modification des alertes
# Services : Prometheus + Alertmanager
```

**Utilisation :**
- Modification des règles d'alerte
- Mise à jour de la configuration
- Ajout de nouvelles métriques

### **4. deploy-alertmanager.yml - Alertes**
```yaml
# Déploiement Alertmanager seul
# Déclenchement : modification des alertes
# Services : Alertmanager uniquement
```

**Utilisation :**
- Modification des templates Discord
- Changement de configuration des alertes
- Test des notifications

### **5. deploy-grafana.yml - Dashboards**
```yaml
# Déploiement Grafana
# Déclenchement : modification des dashboards
# Services : Grafana uniquement
```

**Utilisation :**
- Ajout de nouveaux dashboards
- Modification des visualisations
- Configuration des datasources

### **6. deploy-node-exporter.yml - Métriques Système**
```yaml
# Déploiement Node Exporter
# Déclenchement : workflow_dispatch
# Services : Node Exporter uniquement
```

**Utilisation :**
- Surveillance système
- Métriques hardware
- Monitoring des ressources

## 🔧 Configuration des Secrets

### **Secrets Requis dans GitHub**

#### **Connexion VPS :**
```bash
VPS_HOST          # IP du serveur (ex: IP_VPS)
VPS_USERNAME      # Utilisateur SSH (ex: debian)
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

## 🐳 Architecture Docker

### **Réseau Docker**
```yaml
networks:
  benevoclic-network:
    external: true
```

### **Services API**
```yaml
services:
  api:
    image: ${DOCKERHUB_USERNAME}/benevoclic-api:latest
    container_name: benevoclic-api
    ports: ["3000:3000"]
    environment:
      NODE_ENV: production
      # ... autres variables d'environnement
    networks: [benevoclic-network]
```

### **Services Monitoring**
```yaml
services:
  prometheus:
    image: prom/prometheus:latest
    container_name: prometheus
    ports: ["9090:9090"]
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      - ./alert_rules.yml:/etc/prometheus/alert_rules.yml
    networks: [benevoclic-network]

  alertmanager:
    image: prom/alertmanager:latest
    container_name: alertmanager
    ports: ["9093:9093"]
    volumes:
      - ./alertmanager.yml:/etc/alertmanager/alertmanager.yml
    networks: [benevoclic-network]

  grafana:
    image: grafana/grafana:latest
    container_name: grafana
    ports: ["3001:3000"]
    environment:
      - GF_SECURITY_ADMIN_USER=admin
      - GF_SECURITY_ADMIN_PASSWORD=admin123
    networks: [benevoclic-network]

  node-exporter:
    image: prom/node-exporter:latest
    container_name: node-exporter
    ports: ["9100:9100"]
    volumes:
      - /proc:/host/proc:ro
      - /sys:/host/sys:ro
      - /:/rootfs:ro
    networks: [benevoclic-network]
```

## 🚨 Système d'Alertes

### **Alertes Configurées**

#### **Alertes API :**
- **ServerDown** - API inaccessible
- **ServerUp** - API rétablie
- **ServerInactive** - API inactif

#### **Alertes Système :**
- **SystemDown** - Node Exporter inaccessible
- **SystemUp** - Node Exporter rétabli

### **Notifications Discord**
- **Webhook Discord** configuré
- **Templates personnalisés** pour chaque type d'alerte
- **Couleurs différenciées** (🔴 Rouge pour down, 🟢 Vert pour up)

## 📊 Monitoring et Métriques

### **Prometheus Targets**
- **benevoclic-api:3000** - Métriques API
- **node-exporter:9100** - Métriques système
- **prometheus:9090** - Métriques Prometheus

### **Grafana Dashboards**
- **API Metrics** - Métriques de l'application
- **System Metrics** - Métriques système
- **Alerts Overview** - Vue d'ensemble des alertes

## 🔄 Processus de Déploiement

### **1. Déclenchement**
```bash
# Via GitHub Actions
1. Push sur la branche main
2. Modification de fichiers spécifiques
3. Déclenchement manuel (workflow_dispatch)
```

### **2. Exécution**
```bash
# Sur le VPS
1. Connexion SSH
2. Arrêt des services existants
3. Téléchargement des nouvelles images
4. Démarrage des services
5. Vérification de santé
```

### **3. Validation**
```bash
# Vérifications automatiques
1. Health checks des services
2. Vérification des métriques
3. Test des alertes
4. Validation des dashboards
```

## 🛠️ Commandes de Maintenance

### **Déploiement Rapide**
```bash
# Déployer API seulement
gh workflow run deploy-api.yml

# Déployer monitoring
gh workflow run deploy-prometheus.yml

# Déployer alertes
gh workflow run deploy-alertmanager.yml
```

### **Vérification Post-Déploiement**
```bash
# Vérifier les services
docker ps

# Vérifier les logs
docker logs benevoclic-api --tail 20

# Vérifier les métriques
curl http://IP_VPS:3000/health
curl http://IP_VPS:9090/-/healthy
```

## 📈 Avantages de cette Architecture

### **✅ Modularité**
- Déploiements indépendants
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

## 🔍 Dépannage

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

## 📝 Bonnes Pratiques

### **Avant un Déploiement**
1. ✅ Vérifier les secrets GitHub
2. ✅ Tester en local si possible
3. ✅ Préparer un plan de rollback
4. ✅ Notifier l'équipe

### **Pendant un Déploiement**
1. ✅ Surveiller les logs en temps réel
2. ✅ Vérifier les métriques
3. ✅ Tester les fonctionnalités critiques
4. ✅ Valider les alertes

### **Après un Déploiement**
1. ✅ Vérifier tous les services
2. ✅ Tester les alertes
3. ✅ Valider les dashboards
4. ✅ Documenter les changements

---

## 🎯 Conclusion

Cette architecture de déploiement offre :
- **Flexibilité** avec des workflows modulaires
- **Fiabilité** avec monitoring intégré
- **Observabilité** avec métriques complètes
- **Maintenabilité** avec documentation détaillée

**🚀 Votre infrastructure est prête pour la production !** 