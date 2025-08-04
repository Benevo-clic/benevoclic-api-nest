# 🚀 Déploiement Benevoclic avec Monitoring et Alertes

## 📋 Prérequis

### GitHub Secrets requis :
- `VPS_HOST` - Adresse IP du serveur
- `VPS_USERNAME` - Nom d'utilisateur SSH
- `OVH_SSH_KEY` - Clé SSH privée
- `DOCKERHUB_USERNAME` - Nom d'utilisateur Docker Hub
- `MONGODB_URL` - URL de connexion MongoDB
- `FIREBASE_CLIENT_EMAIL` - Email du service Firebase
- `FIREBASE_PRIVATE_KEY` - Clé privée Firebase
- `FIREBASE_PROJECT_ID` - ID du projet Firebase
- `FIREBASE_API_KEY` - Clé API Firebase
- `AWS_ACCESS_KEY_ID` - Clé d'accès AWS
- `AWS_SECRET_ACCESS_KEY` - Clé secrète AWS
- `AWS_BUCKET_NAME` - Nom du bucket S3
- `AWS_REGION` - Région AWS

## 🚀 Déploiement

### 1. Déclencher le déploiement
- Aller sur GitHub → Actions
- Sélectionner "Deploy to OVH VPS"
- Cliquer "Run workflow"

### 2. Vérification post-déploiement
```bash
# Se connecter au serveur
ssh debian@IP_VPS

# Aller dans le répertoire
cd ~/benevoclic

# Exécuter le script de vérification
chmod +x scripts/verify-deployment.sh
./scripts/verify-deployment.sh
```

## 📊 Services déployés

### API Benevoclic
- **Port :** 3000
- **Health Check :** http://IP_VPS:3000/health
- **Métriques :** http://IP_VPS:3000/metrics

### Prometheus
- **Port :** 9090
- **URL :** http://IP_VPS:9090
- **Fonction :** Collecte et stockage des métriques

### Grafana
- **Port :** 3001
- **URL :** http://IP_VPS:3001
- **Login :** admin / admin123
- **Fonction :** Visualisation des métriques

### Alertmanager
- **Port :** 9093
- **URL :** http://IP_VPS:9093
- **Fonction :** Gestion des alertes et notifications Discord

### Node Exporter
- **Port :** 9100
- **Fonction :** Métriques système (CPU, mémoire, disque)

## 🚨 Alertes configurées

### Alertes API
- **APIDown** - Se déclenche quand l'API s'arrête
- **APIHighErrorRate** - Se déclenche si > 10% d'erreurs 5xx
- **APINoRequests** - Se déclenche si aucune requête depuis 5min

### Alertes Système
- **HighCPUUsage** - Se déclenche si CPU > 80%
- **HighMemoryUsage** - Se déclenche si mémoire > 85%

## 📱 Notifications Discord

Toutes les alertes sont envoyées sur Discord via webhook :
- **Alerte déclenchée** - Message reçu quand un problème survient
- **Alerte résolue** - Message reçu quand le problème est résolu
- **Liens utiles** - Liens vers Prometheus, Grafana, API Health

## 🔧 Commandes utiles

### Vérifier l'état des services
```bash
docker ps
```

### Voir les logs
```bash
# API
docker logs benevoclic-api --tail 20

# Prometheus
docker logs prometheus --tail 10

# Alertmanager
docker logs alertmanager --tail 10

# Grafana
docker logs grafana --tail 10
```

### Vérifier les alertes
```bash
# Alertes actives
curl -s http://localhost:9090/api/v1/alerts

# Règles d'alerte
curl -s http://localhost:9090/api/v1/rules

# Targets Prometheus
curl -s http://localhost:9090/api/v1/targets
```

### Redémarrer un service
```bash
# Redémarrer l'API
docker-compose restart api

# Redémarrer le monitoring
docker-compose -f docker-compose.monitoring.yml restart

# Redémarrer un service spécifique
docker restart prometheus
docker restart alertmanager
docker restart grafana
```

## 🛠️ Dépannage

### Problème : API ne démarre pas
```bash
# Vérifier les logs
docker logs benevoclic-api

# Vérifier les variables d'environnement
docker exec benevoclic-api env | grep MONGODB
```

### Problème : Alertes ne se déclenchent pas
```bash
# Vérifier les règles
curl -s http://localhost:9090/api/v1/rules

# Vérifier les targets
curl -s http://localhost:9090/api/v1/targets

# Vérifier les alertes
curl -s http://localhost:9090/api/v1/alerts
```

### Problème : Notifications Discord ne fonctionnent pas
```bash
# Vérifier les logs Alertmanager
docker logs alertmanager --tail 20

# Tester le webhook Discord
curl -X POST -H "Content-Type: application/json" \
  -d '{"content":"Test webhook"}' \
  $WEBHOOK_URL
```

## 📈 Monitoring

### Métriques disponibles
- **HTTP Requests** - Nombre de requêtes par seconde
- **Response Time** - Temps de réponse moyen
- **Error Rate** - Taux d'erreurs
- **CPU Usage** - Utilisation CPU
- **Memory Usage** - Utilisation mémoire
- **Disk Usage** - Utilisation disque

### Dashboards Grafana
- **API Metrics** - Métriques de l'API
- **System Metrics** - Métriques système
- **Alerts Overview** - Vue d'ensemble des alertes

## 🔄 Mise à jour

Pour mettre à jour l'application :
1. Pousser les changements sur GitHub
2. Déclencher le workflow "Deploy to OVH VPS"
3. Vérifier le déploiement avec le script de vérification

## 📞 Support

En cas de problème :
1. Vérifier les logs des services
2. Consulter les métriques Prometheus
3. Vérifier les alertes actives
4. Contacter l'équipe de développement 