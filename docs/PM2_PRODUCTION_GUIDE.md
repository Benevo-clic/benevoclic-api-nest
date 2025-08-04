# 🚀 Guide PM2 et Maintenance Production - Benevoclic

## 📋 Vue d'ensemble

Ce guide couvre l'utilisation de PM2 pour la gestion des processus en production et les commandes essentielles pour maintenir vos services.

## 🎯 PM2 - Process Manager

### **Qu'est-ce que PM2 ?**
PM2 est un gestionnaire de processus pour Node.js qui permet de :
- **Gérer** les applications Node.js en production
- **Redémarrer** automatiquement en cas de crash
- **Surveiller** les performances
- **Gérer** les logs
- **Clustering** pour la performance

## 🚀 Installation et Configuration

### **Installation PM2**
```bash
# Installation globale
npm install -g pm2

# Vérifier l'installation
pm2 --version
```

### **Configuration PM2**
```bash
# Créer un fichier ecosystem.config.js
pm2 ecosystem

# Ou créer manuellement
cat > ecosystem.config.js << 'EOL'
module.exports = {
  apps: [{
    name: 'benevoclic-api',
    script: 'dist/main.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
};
EOL
```

## 🔧 Commandes PM2 Essentielles

### **Gestion des Applications**
```bash
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

# Relancer une application
pm2 reload benevoclic-api
pm2 reload all
```

### **Surveillance et Monitoring**
```bash
# Voir le statut des applications
pm2 status
pm2 list

# Voir les logs en temps réel
pm2 logs benevoclic-api
pm2 logs --lines 100

# Voir les métriques
pm2 monit

# Voir les informations détaillées
pm2 show benevoclic-api
pm2 info benevoclic-api
```

### **Gestion des Logs**
```bash
# Voir les logs
pm2 logs benevoclic-api
pm2 logs --lines 50

# Vider les logs
pm2 flush

# Voir les logs d'erreur
pm2 logs benevoclic-api --err

# Voir les logs de sortie
pm2 logs benevoclic-api --out
```

### **Clustering et Performance**
```bash
# Démarrer avec plusieurs instances
pm2 start ecosystem.config.js -i max
pm2 start dist/main.js -i 4 --name benevoclic-api

# Redémarrer avec plus d'instances
pm2 scale benevoclic-api 4

# Redémarrer avec moins d'instances
pm2 scale benevoclic-api 2
```

## 🐳 PM2 avec Docker

### **Configuration PM2 dans Docker**

```dockerfile
# Dockerfile avec PM2
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY .. .
RUN npm run build

# Installer PM2 globalement
RUN npm install -g pm2

# Copier la configuration PM2
COPY ../ecosystem.config.js .

# Exposer le port
EXPOSE 3000

# Démarrer avec PM2
CMD ["pm2-runtime", "start", "ecosystem.config.js"]
```

### **Docker Compose avec PM2**
```yaml
# docker-compose.yml
version: '3.8'
services:
  api:
    build: .
    container_name: benevoclic-api
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
    restart: always
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

## 🔄 Déploiement avec PM2

### **Déploiement Simple**
```bash
# Arrêter l'application
pm2 stop benevoclic-api

# Mettre à jour le code
git pull origin main
npm install
npm run build

# Redémarrer l'application
pm2 start benevoclic-api
pm2 restart benevoclic-api
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

## 📊 Monitoring et Métriques

### **Métriques PM2**
```bash
# Voir les métriques en temps réel
pm2 monit

# Voir les statistiques
pm2 show benevoclic-api

# Voir l'utilisation CPU/Mémoire
pm2 status
```

### **Intégration avec Prometheus**
```javascript
// Métriques PM2 pour Prometheus
const pm2 = require('pm2');

pm2.connect((err) => {
  if (err) {
    console.error(err);
    process.exit(2);
  }
  
  pm2.list((err, list) => {
    // Exporter les métriques PM2
    console.log('pm2_processes_total', list.length);
    list.forEach(proc => {
      console.log('pm2_process_memory_bytes', proc.monit.memory);
      console.log('pm2_process_cpu_percent', proc.monit.cpu);
    });
  });
});
```

## 🚨 Alertes et Monitoring

### **Configuration des Alertes PM2**
```bash
# Vérifier si PM2 fonctionne
pm2 ping

# Vérifier les processus
pm2 list

# Vérifier les logs d'erreur
pm2 logs benevoclic-api --err --lines 10
```

### **Script de Monitoring PM2**
```bash
#!/bin/bash
# check-pm2.sh

# Vérifier si PM2 fonctionne
if ! pm2 ping > /dev/null 2>&1; then
    echo "❌ PM2 ne répond pas"
    exit 1
fi

# Vérifier si l'application fonctionne
if ! pm2 list | grep -q "benevoclic-api.*online"; then
    echo "❌ Benevoclic API n'est pas en ligne"
    pm2 restart benevoclic-api
    exit 1
fi

# Vérifier la santé de l'API
if ! curl -f http://IP_VPS:3000/health > /dev/null 2>&1; then
    echo "❌ API ne répond pas"
    pm2 restart benevoclic-api
    exit 1
fi

echo "✅ PM2 et API fonctionnent correctement"
```

## 🛠️ Commandes de Maintenance Production

### **Surveillance Quotidienne**
```bash
# Vérifier l'état général
pm2 status
docker ps

# Vérifier les logs récents
pm2 logs benevoclic-api --lines 20
docker logs benevoclic-api --tail 20

# Vérifier les métriques
pm2 monit
docker stats

# Vérifier l'espace disque
df -h
du -sh /var/log/pm2/
```

### **Maintenance Hebdomadaire**
```bash
# Nettoyer les logs PM2
pm2 flush

# Nettoyer les logs Docker
docker system prune -f

# Vérifier les mises à jour
npm outdated
docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}"

# Sauvegarder la configuration PM2
pm2 save
pm2 startup
```

### **Maintenance Mensuelle**
```bash
# Redémarrer tous les services
pm2 restart all
docker-compose restart

# Vérifier les performances
pm2 monit
docker stats --no-stream

# Nettoyer les anciens logs
find /var/log/pm2/ -name "*.log" -mtime +30 -delete
docker system prune -a -f
```

## 🔧 Dépannage PM2

### **Problèmes Courants**

#### **Application ne démarre pas :**
```bash
# Vérifier les logs
pm2 logs benevoclic-api

# Vérifier la configuration
pm2 show benevoclic-api

# Redémarrer avec plus de logs
pm2 start ecosystem.config.js --log

# Vérifier les variables d'environnement
pm2 env benevoclic-api
```

#### **Application crash fréquemment :**
```bash
# Vérifier la mémoire
pm2 monit

# Augmenter la limite mémoire
pm2 restart benevoclic-api --max-memory-restart 2G

# Vérifier les logs d'erreur
pm2 logs benevoclic-api --err

# Redémarrer avec moins d'instances
pm2 scale benevoclic-api 1
```

#### **Performance dégradée :**
```bash
# Vérifier l'utilisation CPU/Mémoire
pm2 monit

# Redémarrer l'application
pm2 restart benevoclic-api

# Vérifier les processus
pm2 list

# Nettoyer les logs
pm2 flush
```

## 📈 Optimisation PM2

### **Configuration Optimisée**
```javascript
// ecosystem.config.js optimisé
module.exports = {
  apps: [{
    name: 'benevoclic-api',
    script: 'dist/main.js',
    instances: 'max', // Utiliser tous les CPU
    exec_mode: 'cluster',
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    node_args: '--max-old-space-size=1024',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
```

### **Monitoring Avancé**
```bash
# Sauvegarder la configuration
pm2 save

# Configurer le démarrage automatique
pm2 startup

# Voir les métriques détaillées
pm2 show benevoclic-api

# Voir les logs avec timestamp
pm2 logs benevoclic-api --timestamp
```

## 🔄 Scripts de Déploiement

### **Script de Déploiement Automatique**
```bash
#!/bin/bash
# deploy.sh

echo "🚀 Déploiement Benevoclic API"

# Arrêter l'application
pm2 stop benevoclic-api

# Mettre à jour le code
git pull origin main

# Installer les dépendances
npm install

# Build de l'application
npm run build

# Redémarrer l'application
pm2 start benevoclic-api

# Vérifier le statut
sleep 5
pm2 status

# Vérifier la santé
curl -f http://IP_VPS:3000/health

echo "✅ Déploiement terminé"
```

### **Script de Rollback**
```bash
#!/bin/bash
# rollback.sh

echo "🔄 Rollback Benevoclic API"

# Arrêter l'application
pm2 stop benevoclic-api

# Revenir à la version précédente
git reset --hard HEAD~1

# Installer les dépendances
npm install

# Build de l'application
npm run build

# Redémarrer l'application
pm2 start benevoclic-api

echo "✅ Rollback terminé"
```

## 📊 Intégration avec le Monitoring

### **Métriques PM2 pour Prometheus**
```javascript
// metrics-pm2.js
const prometheus = require('prom-client');
const pm2 = require('pm2');

const pm2ProcessesTotal = new prometheus.Gauge({
  name: 'pm2_processes_total',
  help: 'Total number of PM2 processes'
});

const pm2ProcessMemory = new prometheus.Gauge({
  name: 'pm2_process_memory_bytes',
  help: 'Memory usage per PM2 process',
  labelNames: ['name']
});

const pm2ProcessCpu = new prometheus.Gauge({
  name: 'pm2_process_cpu_percent',
  help: 'CPU usage per PM2 process',
  labelNames: ['name']
});

// Mettre à jour les métriques
function updatePm2Metrics() {
  pm2.list((err, list) => {
    if (err) return;
    
    pm2ProcessesTotal.set(list.length);
    
    list.forEach(proc => {
      pm2ProcessMemory.labels(proc.name).set(proc.monit.memory);
      pm2ProcessCpu.labels(proc.name).set(proc.monit.cpu);
    });
  });
}

setInterval(updatePm2Metrics, 15000);
```

## 🚨 Alertes PM2

### **Configuration des Alertes**
```bash
# Script de vérification PM2
#!/bin/bash
# check-pm2-alerts.sh

# Vérifier si PM2 fonctionne
if ! pm2 ping > /dev/null 2>&1; then
    curl -X POST -H "Content-Type: application/json" \
      -d '{"content":"🚨 PM2 ne répond pas sur IP_VPS"}' \
      <discord-webhook-url>
fi

# Vérifier si l'application fonctionne
if ! pm2 list | grep -q "benevoclic-api.*online"; then
    curl -X POST -H "Content-Type: application/json" \
      -d '{"content":"🚨 Benevoclic API PM2 n'\''est pas en ligne sur IP_VPS"}' \
      <discord-webhook-url>
fi
```

## 📝 Checklist de Maintenance

### **Quotidien**
- [ ] Vérifier `pm2 status`
- [ ] Vérifier `pm2 logs benevoclic-api --lines 10`
- [ ] Vérifier la santé de l'API
- [ ] Vérifier l'utilisation mémoire/CPU

### **Hebdomadaire**
- [ ] Nettoyer les logs PM2 (`pm2 flush`)
- [ ] Vérifier les mises à jour npm
- [ ] Sauvegarder la configuration PM2
- [ ] Vérifier les performances

### **Mensuel**
- [ ] Redémarrer tous les services
- [ ] Nettoyer les anciens logs
- [ ] Vérifier la configuration PM2
- [ ] Mettre à jour les dépendances

---

## 🎯 Conclusion

PM2 offre une gestion robuste des applications Node.js en production avec :
- **Gestion automatique** des processus
- **Monitoring intégré** des performances
- **Logs centralisés** et rotation automatique
- **Clustering** pour la performance
- **Redémarrage automatique** en cas de crash

**🚀 Votre application est maintenant prête pour la production avec PM2 !** 