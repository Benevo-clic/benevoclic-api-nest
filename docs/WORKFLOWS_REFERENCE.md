# 🔄 Guide de Référence - Workflows GitHub Actions

## 📋 Vue d'ensemble des Workflows

| Workflow | Déclenchement | Services | Utilisation |
|----------|---------------|----------|-------------|
| `deploy.yml` | Push main + Manual | Tous | Déploiement complet |
| `deploy-api.yml` | API files + Manual | API | Mise à jour API |
| `deploy-prometheus.yml` | Alert rules + Manual | Prometheus + Alertmanager | Monitoring |
| `deploy-alertmanager.yml` | Manual | Alertmanager | Alertes |
| `deploy-grafana.yml` | Grafana files + Manual | Grafana | Dashboards |
| `deploy-node-exporter.yml` | Manual | Node Exporter | Métriques système |

## 🚀 Déclenchement des Workflows

### **1. Déploiement Complet**
```bash
# Via GitHub Actions
1. Aller sur GitHub → Actions
2. Sélectionner "Deploy to OVH VPS"
3. Cliquer "Run workflow"
```

### **2. Déploiement API**
```bash
# Déclenchement automatique
- Modification de src/**
- Modification de package.json
- Modification de Dockerfile

# Déclenchement manuel
- GitHub Actions → deploy-api.yml → Run workflow
```

### **3. Déploiement Monitoring**
```bash
# Déclenchement automatique
- Modification de alert_rules.yml
- Modification de prometheus.yml

# Déclenchement manuel
- GitHub Actions → deploy-prometheus.yml → Run workflow
```

### **4. Déploiement Alertes**
```bash
# Déclenchement manuel uniquement
- GitHub Actions → deploy-alertmanager.yml → Run workflow
```

### **5. Déploiement Grafana**
```bash
# Déclenchement automatique
- Modification de grafana/**

# Déclenchement manuel
- GitHub Actions → deploy-grafana.yml → Run workflow
```

### **6. Déploiement Node Exporter**
```bash
# Déclenchement manuel uniquement
- GitHub Actions → deploy-node-exporter.yml → Run workflow
```

## 🔧 Configuration des Secrets

### **Secrets Requis**
```bash
# Connexion VPS
VPS_HOST          # IP du serveur
VPS_USERNAME      # Utilisateur SSH
OVH_SSH_KEY       # Clé SSH privée

# Docker Hub
DOCKERHUB_USERNAME # Nom d'utilisateur

# Base de données
MONGODB_URL       # URL MongoDB
MONGODB_DB_NAME   # Nom de la DB

# Firebase
FIREBASE_CLIENT_EMAIL    # Email service
FIREBASE_PRIVATE_KEY     # Clé privée
FIREBASE_PROJECT_ID      # ID projet
FIREBASE_API_KEY         # Clé API

# AWS S3
AWS_ACCESS_KEY_ID       # Clé accès
AWS_SECRET_ACCESS_KEY   # Clé secrète
AWS_BUCKET_NAME         # Nom bucket
AWS_REGION              # Région
```

## 📊 Services et Ports

### **API Benevoclic**
- **Port :** 3000
- **Health :** http://IP_VPS:3000/health
- **Métriques :** http://IP_VPS:3000/metrics

### **Prometheus**
- **Port :** 9090
- **URL :** http://IP_VPS:9090
- **API :** http://IP_VPS:9090/api/v1

### **Alertmanager**
- **Port :** 9093
- **URL :** http://IP_VPS:9093
- **API :** http://IP_VPS:9093/api/v1

### **Grafana**
- **Port :** 3001
- **URL :** http://IP_VPS:3001
- **Login :** admin / admin123

### **Node Exporter**
- **Port :** 9100
- **Métriques :** http://IP_VPS:9100/metrics

## 🚨 Alertes Configurées

### **Alertes API**
```yaml
ServerDown      # API inaccessible
ServerUp        # API rétablie
ServerInactive  # API inactif
```

### **Alertes Système**
```yaml
SystemDown      # Node Exporter inaccessible
SystemUp        # Node Exporter rétabli
```

### **Notifications Discord**
- **Webhook :** Configuré
- **Templates :** Personnalisés
- **Couleurs :** 🔴 Rouge (down) / 🟢 Vert (up)

## 🛠️ Commandes de Vérification

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

### **Vérification Détaillée**
```bash
# Métriques Prometheus
curl http://IP_VPS:9090/api/v1/targets
curl http://IP_VPS:9090/api/v1/alerts

# Configuration Alertmanager
curl http://IP_VPS:9093/api/v1/status

# Métriques système
curl http://IP_VPS:9100/metrics
```

## 🔄 Processus de Déploiement

### **Étapes Automatiques**
1. **Connexion SSH** au VPS
2. **Arrêt** des services existants
3. **Téléchargement** des nouvelles images
4. **Démarrage** des services
5. **Vérification** de santé
6. **Attente** du démarrage complet

### **Vérifications Post-Déploiement**
```bash
# Vérifier les conteneurs
docker ps -a

# Vérifier les logs
docker logs <service-name> --tail 20

# Vérifier les métriques
curl http://IP_VPS:3000/health
curl http://IP_VPS:9090/-/healthy

# Vérifier les alertes
curl http://IP_VPS:9093/api/v1/alerts
```

## 🆘 Dépannage

### **Problème : Service ne démarre pas**
```bash
# Vérifier les logs
docker logs <service-name>

# Vérifier la configuration
docker exec <service-name> cat /etc/config.yml

# Redémarrer le service
docker restart <service-name>
```

### **Problème : Alertes ne fonctionnent pas**
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

### **Problème : Métriques manquantes**
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

## 🎯 Workflow Recommandé

### **Déploiement Standard**
1. **Modifier** le code
2. **Pousser** sur main
3. **Attendre** le déploiement automatique
4. **Vérifier** les services
5. **Tester** les fonctionnalités

### **Déploiement d'Urgence**
1. **Identifier** le problème
2. **Déclencher** le workflow approprié
3. **Surveiller** les logs
4. **Vérifier** la résolution
5. **Documenter** l'incident

---

## 🚀 Conclusion

Cette architecture de workflows offre :
- **Flexibilité** avec des déploiements ciblés
- **Fiabilité** avec monitoring intégré
- **Simplicité** avec déclenchement automatique
- **Contrôle** avec déclenchement manuel

**🎉 Votre pipeline de déploiement est optimisé !** 