# 🛠️ Commandes de Production - Benevoclic

## 📋 Vue d'ensemble

Ce guide contient toutes les commandes essentielles pour maintenir vos services en production, incluant PM2, Docker, et le monitoring.

## 🚀 Commandes PM2

### **Gestion des Applications**
```bash
# Voir le statut
pm2 status
pm2 list

# Démarrer une application
pm2 start ecosystem.config.js
pm2 start dist/main.js --name benevoclic-api

# Arrêter une application
pm2 stop benevoclic-api
pm2 stop all

# Redémarrer une application
pm2 restart benevoclic-api
pm2 restart all

# Supprimer une application
pm2 delete benevoclic-api
pm2 delete all

# Relancer (zero-downtime)
pm2 reload benevoclic-api
pm2 reload all
```

### **Monitoring PM2**
```bash
# Voir les logs en temps réel
pm2 logs benevoclic-api
pm2 logs --lines 100

# Voir les métriques
pm2 monit

# Voir les informations détaillées
pm2 show benevoclic-api
pm2 info benevoclic-api

# Voir les logs d'erreur
pm2 logs benevoclic-api --err

# Voir les logs de sortie
pm2 logs benevoclic-api --out
```

### **Gestion des Logs PM2**
```bash
# Vider les logs
pm2 flush

# Voir les logs avec timestamp
pm2 logs benevoclic-api --timestamp

# Voir les logs des 10 dernières lignes
pm2 logs benevoclic-api --lines 10
```

### **Clustering PM2**
```bash
# Démarrer avec plusieurs instances
pm2 start ecosystem.config.js -i max
pm2 start dist/main.js -i 4 --name benevoclic-api

# Redimensionner les instances
pm2 scale benevoclic-api 4
pm2 scale benevoclic-api 2

# Voir les instances
pm2 list
```

## 🐳 Commandes Docker

### **Gestion des Conteneurs**
```bash
# Voir tous les conteneurs
docker ps -a

# Voir les conteneurs en cours d'exécution
docker ps

# Démarrer un conteneur
docker start benevoclic-api

# Arrêter un conteneur
docker stop benevoclic-api

# Redémarrer un conteneur
docker restart benevoclic-api

# Supprimer un conteneur
docker rm benevoclic-api
```

### **Logs Docker**
```bash
# Voir les logs en temps réel
docker logs -f benevoclic-api

# Voir les logs des 20 dernières lignes
docker logs --tail 20 benevoclic-api

# Voir les logs depuis une date
docker logs --since "2024-01-01T00:00:00" benevoclic-api
```

### **Docker Compose**
```bash
# Démarrer tous les services
docker-compose up -d

# Arrêter tous les services
docker-compose down

# Redémarrer tous les services
docker-compose restart

# Voir les logs de tous les services
docker-compose logs -f

# Reconstruire et redémarrer
docker-compose up -d --build
```

### **Nettoyage Docker**
```bash
# Supprimer les conteneurs arrêtés
docker container prune

# Supprimer les images non utilisées
docker image prune

# Supprimer les volumes non utilisés
docker volume prune

# Nettoyage complet
docker system prune -a
```

## 📊 Monitoring et Métriques

### **Vérification des Services**
```bash
# Vérifier l'API
curl http://IP_VPS:3000/health

# Vérifier Prometheus
curl http://IP_VPS:9090/-/healthy

# Vérifier Alertmanager
curl http://IP_VPS:9093/-/healthy

# Vérifier Grafana
curl http://IP_VPS:3001/api/health

# Vérifier Node Exporter
curl http://IP_VPS:9100/metrics
```

### **Métriques Prometheus**
```bash
# Voir les targets
curl http://IP_VPS:9090/api/v1/targets

# Voir les alertes actives
curl http://IP_VPS:9090/api/v1/alerts

# Voir les règles
curl http://IP_VPS:9090/api/v1/rules

# Requête métrique
curl "http://IP_VPS:9090/api/v1/query?query=up"
```

### **Alertmanager**
```bash
# Vérifier le statut
curl http://IP_VPS:9093/api/v1/status

# Voir les alertes
curl http://IP_VPS:9093/api/v1/alerts

# Voir les silences
curl http://IP_VPS:9093/api/v1/silences
```

## 🔧 Maintenance Système

### **Surveillance des Ressources**
```bash
# Voir l'utilisation CPU/Mémoire
htop
top

# Voir l'espace disque
df -h

# Voir l'utilisation mémoire
free -h

# Voir les processus
ps aux | grep node
ps aux | grep pm2
```

### **Logs Système**
```bash
# Voir les logs système
journalctl -f

# Voir les logs Docker
journalctl -u docker

# Voir les logs PM2
journalctl -u pm2-debian
```

### **Réseau**
```bash
# Voir les ports ouverts
netstat -tlnp

# Voir les connexions actives
ss -tuln

# Tester la connectivité
ping IP_VPS
telnet IP_VPS 3000
```

## 🚨 Dépannage

### **Problèmes PM2**
```bash
# Vérifier si PM2 fonctionne
pm2 ping

# Redémarrer PM2
pm2 kill
pm2 resurrect

# Vérifier la configuration
pm2 show benevoclic-api

# Vérifier les variables d'environnement
pm2 env benevoclic-api
```

### **Problèmes Docker**
```bash
# Vérifier les logs Docker
docker logs benevoclic-api

# Inspecter un conteneur
docker inspect benevoclic-api

# Vérifier les ressources
docker stats

# Redémarrer Docker
sudo systemctl restart docker
```

### **Problèmes Réseau**
```bash
# Vérifier les réseaux Docker
docker network ls
docker network inspect benevoclic-network

# Recréer le réseau
docker network rm benevoclic-network
docker network create benevoclic-network
```

## 🔄 Déploiement

### **Déploiement PM2**
```bash
# Arrêter l'application
pm2 stop benevoclic-api

# Mettre à jour le code
git pull origin main
npm install
npm run build

# Redémarrer l'application
pm2 start benevoclic-api

# Vérifier le statut
pm2 status
```

### **Déploiement Docker**
```bash
# Arrêter les services
docker-compose down

# Mettre à jour les images
docker-compose pull

# Redémarrer les services
docker-compose up -d

# Vérifier les services
docker ps
```

### **Déploiement Zero-Downtime**
```bash
# Démarrer une nouvelle instance
pm2 start ecosystem.config.js --env production

# Attendre que la nouvelle instance soit prête
sleep 10

# Vérifier la santé
curl http://IP_VPS:3000/health

# Arrêter l'ancienne instance
pm2 stop benevoclic-api-old

# Renommer les instances
pm2 restart benevoclic-api
```

## 📈 Optimisation

### **Optimisation PM2**
```bash
# Sauvegarder la configuration
pm2 save

# Configurer le démarrage automatique
pm2 startup

# Optimiser la mémoire
pm2 restart benevoclic-api --max-memory-restart 2G

# Utiliser tous les CPU
pm2 start ecosystem.config.js -i max
```

### **Optimisation Docker**
```bash
# Nettoyer les images non utilisées
docker image prune -a

# Nettoyer les volumes
docker volume prune

# Optimiser l'espace disque
docker system prune -a -f
```

## 🛡️ Sécurité

### **Vérification de Sécurité**
```bash
# Vérifier les processus
ps aux | grep -E "(node|pm2|docker)"

# Vérifier les ports ouverts
netstat -tlnp | grep -E "(3000|9090|9093)"

# Vérifier les permissions
ls -la /var/log/pm2/
ls -la /var/lib/docker/
```

### **Mise à jour Sécurité**
```bash
# Mettre à jour le système
sudo apt update
sudo apt upgrade -y

# Mettre à jour Docker
sudo apt update
sudo apt install docker-ce docker-ce-cli containerd.io

# Mettre à jour PM2
npm install -g pm2@latest
```

## 📝 Scripts Utiles

### **Script de Vérification Rapide**
```bash
#!/bin/bash
# quick-check.sh

echo "🔍 Vérification rapide des services"

# Vérifier PM2
echo "📊 PM2 Status:"
pm2 status

# Vérifier Docker
echo "🐳 Docker Status:"
docker ps

# Vérifier les services
echo "🌐 Services Health:"
curl -s http://IP_VPS:3000/health && echo " ✅ API"
curl -s http://IP_VPS:9090/-/healthy && echo " ✅ Prometheus"
curl -s http://IP_VPS:9093/-/healthy && echo " ✅ Alertmanager"

# Vérifier les ressources
echo "💾 Ressources:"
df -h | grep -E "(/dev/|Filesystem)"
free -h | grep -E "(Mem|Swap)"
```

### **Script de Maintenance**
```bash
#!/bin/bash
# maintenance.sh

echo "🛠️ Maintenance des services"

# Nettoyer les logs PM2
pm2 flush

# Nettoyer Docker
docker system prune -f

# Redémarrer les services
pm2 restart all
docker-compose restart

# Vérifier le statut
sleep 10
pm2 status
docker ps

echo "✅ Maintenance terminée"
```

### **Script de Sauvegarde**
```bash
#!/bin/bash
# backup.sh

echo "💾 Sauvegarde des configurations"

# Sauvegarder PM2
pm2 save

# Sauvegarder les configurations
tar czf backup-$(date +%Y%m%d).tar.gz \
  ecosystem.config.js \
  docker-compose*.yml \
  prometheus.yml \
  alert_rules.yml \
  alertmanager.yml

echo "✅ Sauvegarde terminée"
```

## 🚨 Alertes et Monitoring

### **Script de Vérification des Alertes**
```bash
#!/bin/bash
# check-alerts.sh

# Vérifier PM2
if ! pm2 ping > /dev/null 2>&1; then
    echo "🚨 PM2 ne répond pas"
    exit 1
fi

# Vérifier l'API
if ! curl -f http://IP_VPS:3000/health > /dev/null 2>&1; then
    echo "🚨 API ne répond pas"
    pm2 restart benevoclic-api
    exit 1
fi

# Vérifier Prometheus
if ! curl -f http://IP_VPS:9090/-/healthy > /dev/null 2>&1; then
    echo "🚨 Prometheus ne répond pas"
    docker restart prometheus
    exit 1
fi

echo "✅ Tous les services fonctionnent"
```

## 📋 Checklist Quotidienne

### **Vérifications Quotidiennes**
```bash
# 1. Vérifier PM2
pm2 status

# 2. Vérifier Docker
docker ps

# 3. Vérifier les services
curl http://IP_VPS:3000/health
curl http://IP_VPS:9090/-/healthy
curl http://IP_VPS:9093/-/healthy

# 4. Vérifier les logs
pm2 logs benevoclic-api --lines 10
docker logs benevoclic-api --tail 10

# 5. Vérifier les ressources
htop
df -h
```

### **Vérifications Hebdomadaires**
```bash
# 1. Nettoyer les logs
pm2 flush
docker system prune -f

# 2. Vérifier les mises à jour
npm outdated
docker images

# 3. Sauvegarder la configuration
pm2 save

# 4. Vérifier les performances
pm2 monit
docker stats
```

---

## 🎯 Conclusion

Ces commandes vous permettent de :
- **Gérer efficacement** vos services en production
- **Surveiller** les performances et la santé
- **Dépanner** rapidement les problèmes
- **Maintenir** une infrastructure stable

**🚀 Votre infrastructure est maintenant bien documentée et facile à maintenir !** 