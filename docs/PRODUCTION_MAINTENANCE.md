# 🚀 Guide de Maintenance Production - Benevoclic

## 📋 Table des Matières
- [🔍 Monitoring et Surveillance](#monitoring-et-surveillance)
- [🐳 Gestion des Conteneurs Docker](#gestion-des-conteneurs-docker)
- [📊 Logs et Diagnostics](#logs-et-diagnostics)
- [🔄 Redémarrage et Déploiement](#redémarrage-et-déploiement)
- [🔧 Configuration et Maintenance](#configuration-et-maintenance)
- [🚨 Gestion des Alertes](#gestion-des-alertes)
- [💾 Sauvegarde et Restauration](#sauvegarde-et-restauration)
- [🔐 Sécurité et Accès](#sécurité-et-accès)

---

## 🔍 Monitoring et Surveillance

### **Vérification de l'état général**
```bash
# Vérifier l'état de tous les services
docker ps -a

# Vérifier l'utilisation des ressources
docker stats

# Vérifier l'espace disque
df -h

# Vérifier la mémoire
free -h

# Vérifier les processus
htop
```

### **Surveillance des services**
```bash
# Vérifier l'API Benevoclic
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

---

## 🐳 Gestion des Conteneurs Docker

### **Commandes de base**
```bash
# Lister tous les conteneurs
docker ps -a

# Démarrer un service spécifique
docker-compose -f docker-compose.api.yml up -d

# Arrêter un service spécifique
docker-compose -f docker-compose.api.yml down

# Redémarrer un service
docker-compose -f docker-compose.api.yml restart

# Mettre à jour une image
docker-compose -f docker-compose.api.yml pull
docker-compose -f docker-compose.api.yml up -d
```

### **Gestion du monitoring**
```bash
# Démarrer le monitoring complet
docker-compose -f docker-compose.monitoring.yml up -d

# Arrêter le monitoring
docker-compose -f docker-compose.monitoring.yml down

# Redémarrer Alertmanager
docker-compose -f docker-compose.alertmanager.yml restart

# Redémarrer Prometheus
docker-compose -f docker-compose.prometheus.yml restart

# Redémarrer Grafana
docker-compose -f docker-compose.grafana.yml restart
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

---

## 📊 Logs et Diagnostics

### **Consultation des logs**
```bash
# Logs de l'API
docker logs benevoclic-api -f

# Logs de Prometheus
docker logs prometheus -f

# Logs d'Alertmanager
docker logs alertmanager -f

# Logs de Grafana
docker logs grafana -f

# Logs de Node Exporter
docker logs node-exporter -f

# Logs de tous les services
docker-compose logs -f
```

### **Diagnostics avancés**
```bash
# Vérifier les métriques Prometheus
curl http://IP_VPS:9090/api/v1/query?query=up

# Vérifier les alertes actives
curl http://IP_VPS:9090/api/v1/alerts

# Vérifier les targets Prometheus
curl http://IP_VPS:9090/api/v1/targets

# Vérifier la configuration Alertmanager
curl http://IP_VPS:9093/api/v1/status
```

### **Vérification des réseaux**
```bash
# Lister les réseaux Docker
docker network ls

# Inspecter le réseau Benevoclic
docker network inspect benevoclic-network

# Vérifier la connectivité entre conteneurs
docker exec benevoclic-api ping prometheus
docker exec benevoclic-api ping alertmanager
```

---

## 🔄 Redémarrage et Déploiement

### **Redémarrage complet**
```bash
# Arrêter tous les services
docker-compose down
docker-compose -f docker-compose.monitoring.yml down

# Redémarrer tous les services
docker-compose up -d
docker-compose -f docker-compose.monitoring.yml up -d

# Vérifier le statut
docker ps
```

### **Redémarrage sélectif**
```bash
# Redémarrer seulement l'API
docker-compose restart api

# Redémarrer seulement le monitoring
docker-compose -f docker-compose.monitoring.yml restart

# Redémarrer un service spécifique
docker restart benevoclic-api
docker restart prometheus
docker restart alertmanager
```

### **Déploiement via GitHub Actions**
```bash
# Déclencher le déploiement complet
# Via GitHub: Actions > deploy.yml > Run workflow

# Déclencher le déploiement API seulement
# Via GitHub: Actions > deploy-api.yml > Run workflow

# Déclencher le déploiement Alertmanager
# Via GitHub: Actions > deploy-alertmanager.yml > Run workflow
```

---

## 🔧 Configuration et Maintenance

### **Modification des configurations**
```bash
# Éditer la configuration Prometheus
nano prometheus.yml

# Éditer les règles d'alerte
nano alert_rules.yml

# Éditer la configuration Alertmanager
nano alertmanager.yml

# Recharger les configurations
docker-compose -f docker-compose.monitoring.yml restart
```

### **Mise à jour des images**
```bash
# Mettre à jour toutes les images
docker-compose pull
docker-compose -f docker-compose.monitoring.yml pull

# Redémarrer avec les nouvelles images
docker-compose up -d
docker-compose -f docker-compose.monitoring.yml up -d
```

### **Vérification des configurations**
```bash
# Vérifier la syntaxe Prometheus
docker exec prometheus promtool check config /etc/prometheus/prometheus.yml

# Vérifier la syntaxe Alertmanager
docker exec alertmanager amtool check-config /etc/alertmanager/alertmanager.yml

# Tester les règles d'alerte
docker exec prometheus promtool check rules /etc/prometheus/alert_rules.yml
```

---

## 🚨 Gestion des Alertes

### **Interface Alertmanager**
```bash
# Accéder à l'interface web
# URL: http://IP_VPS:9093

# Vérifier les alertes via API
curl http://IP_VPS:9093/api/v1/alerts

# Vérifier les silences
curl http://IP_VPS:9093/api/v1/silences
```

### **Gestion des silences**
```bash
# Créer un silence via API
curl -X POST http://IP_VPS:9093/api/v1/silences \
  -H "Content-Type: application/json" \
  -d '{
    "matchers": [{"name": "alertname", "value": "ServerDown", "isRegex": false}],
    "startsAt": "'$(date -u +%Y-%m-%dT%H:%M:%S.000Z)'",
    "endsAt": "'$(date -u -d '+1 hour' +%Y-%m-%dT%H:%M:%S.000Z)'",
    "createdBy": "admin",
    "comment": "Maintenance planifiée"
  }'
```

### **Test des alertes**
```bash
# Simuler une alerte de test
curl -X POST http://IP_VPS:9093/api/v1/alerts \
  -H "Content-Type: application/json" \
  -d '[
    {
      "labels": {
        "alertname": "TestAlert",
        "severity": "warning"
      },
      "annotations": {
        "summary": "Test Alert",
        "description": "This is a test alert"
      }
    }
  ]'
```

---

## 💾 Sauvegarde et Restauration

### **Sauvegarde des données**
```bash
# Sauvegarder les volumes Docker
docker run --rm -v benevoclic_prometheus_data:/data -v $(pwd):/backup alpine tar czf /backup/prometheus_backup.tar.gz -C /data .
docker run --rm -v benevoclic_grafana_data:/data -v $(pwd):/backup alpine tar czf /backup/grafana_backup.tar.gz -C /data .
docker run --rm -v benevoclic_alertmanager_data:/data -v $(pwd):/backup alpine tar czf /backup/alertmanager_backup.tar.gz -C /data .

# Sauvegarder les configurations
tar czf config_backup.tar.gz prometheus.yml alert_rules.yml alertmanager.yml docker-compose*.yml
```

### **Restauration des données**
```bash
# Restaurer Prometheus
docker run --rm -v benevoclic_prometheus_data:/data -v $(pwd):/backup alpine tar xzf /backup/prometheus_backup.tar.gz -C /data

# Restaurer Grafana
docker run --rm -v benevoclic_grafana_data:/data -v $(pwd):/backup alpine tar xzf /backup/grafana_backup.tar.gz -C /data

# Restaurer Alertmanager
docker run --rm -v benevoclic_alertmanager_data:/data -v $(pwd):/backup alpine tar xzf /backup/alertmanager_backup.tar.gz -C /data

# Redémarrer les services
docker-compose -f docker-compose.monitoring.yml restart
```

---

## 🔐 Sécurité et Accès

### **Vérification des accès**
```bash
# Vérifier les ports ouverts
netstat -tlnp

# Vérifier les connexions actives
ss -tuln

# Vérifier les logs de sécurité
journalctl -u ssh
journalctl -u docker
```

### **Gestion des certificats SSL**
```bash
# Vérifier les certificats SSL
openssl s_client -connect IP_VPS:443 -servername benevoclic.com

# Vérifier la validité des certificats
echo | openssl s_client -connect IP_VPS:443 -servername benevoclic.com 2>/dev/null | openssl x509 -noout -dates
```

### **Mise à jour système**
```bash
# Mettre à jour le système
sudo apt update
sudo apt upgrade -y

# Redémarrer si nécessaire
sudo reboot

# Vérifier les mises à jour de sécurité
sudo apt list --upgradable
```

---

## 🆘 Commandes d'Urgence

### **En cas de panne complète**
```bash
# Arrêter tous les services
docker-compose down
docker-compose -f docker-compose.monitoring.yml down

# Nettoyer les conteneurs
docker system prune -f

# Redémarrer Docker
sudo systemctl restart docker

# Redémarrer tous les services
docker-compose up -d
docker-compose -f docker-compose.monitoring.yml up -d
```

### **En cas de problème de réseau**
```bash
# Recréer le réseau Docker
docker network rm benevoclic-network
docker network create benevoclic-network

# Redémarrer les services
docker-compose up -d
docker-compose -f docker-compose.monitoring.yml up -d
```

### **En cas de problème de stockage**
```bash
# Vérifier l'espace disque
df -h

# Nettoyer les logs Docker
sudo journalctl --vacuum-time=7d

# Nettoyer les images Docker
docker image prune -a -f
```

---

## 📞 Contacts et Support

### **Liens utiles**
- **Prometheus**: http://IP_VPS:9090
- **Grafana**: http://IP_VPS:3001
- **Alertmanager**: http://IP_VPS:9093
- **API Health**: http://IP_VPS:3000/health

### **Logs importants**
- **API Logs**: `docker logs benevoclic-api`
- **Prometheus Logs**: `docker logs prometheus`
- **Alertmanager Logs**: `docker logs alertmanager`
- **Grafana Logs**: `docker logs grafana`

### **Commandes de diagnostic rapide**
```bash
# État général du système
docker ps && echo "---" && df -h && echo "---" && free -h

# Vérification des services
curl -s http://IP_VPS:3000/health && echo && curl -s http://IP_VPS:9090/-/healthy && echo && curl -s http://IP_VPS:9093/-/healthy

# Logs récents
docker logs --tail=20 benevoclic-api
```

---

## 📝 Notes de Maintenance

### **Maintenance planifiée**
1. **Avant la maintenance** : Créer des silences dans Alertmanager
2. **Pendant la maintenance** : Surveiller les logs en temps réel
3. **Après la maintenance** : Vérifier tous les services et supprimer les silences

### **Procédure de sauvegarde**
- **Quotidienne** : Sauvegarde des configurations
- **Hebdomadaire** : Sauvegarde complète des volumes
- **Mensuelle** : Test de restauration

### **Monitoring continu**
- Surveiller les métriques Prometheus
- Vérifier les alertes Discord
- Contrôler l'utilisation des ressources

---

*Dernière mise à jour : $(date)*
*Version : 1.0*
*Maintenu par : Équipe Benevoclic* 