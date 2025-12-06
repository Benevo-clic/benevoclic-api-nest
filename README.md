# 🚀 Benevoclic API - Documentation de Déploiement

## 📋 Vue d'ensemble

API REST moderne construite avec NestJS 11.0.7 pour la plateforme Benevoclic, connectant les associations avec des
bénévoles. Architecture modulaire avec monitoring complet, authentification Firebase et base de données MongoDB.

## 📌 Liens utiles

### 🌐 Application

- **Benevoclic** : https://www.benevoclic.fr

### 💻 GitHub

- **Front-end** : https://github.com/Benevo-clic/benevoclic-web
- **Back-end** : https://github.com/Benevo-clic/benevoclic-api-nest
- **Documentation** : https://github.com/Benevo-clic/benevoclic-docs

### 📊 Monitoring

- **Grafana (Dashboard)** : http://mon_ip:3001/dashboards
- **Prometheus (Query)** : http://mon_ip:9090/query
- **AlertManager (Alerts)** : http://mon_ip:9093/#/alerts
- **API Health (Status)** : http://mon_ip:3000/health

### 💬 Communication

- **Discord (Support)** : https://discord.gg/F7NMNGT9

## 🛠️ Technologies

- **Framework** : NestJS 11.0.7 + TypeScript
- **Base de données** : MongoDB 6.13.0
- **Authentification** : Firebase Admin SDK 13.0.2
- **Stockage** : AWS S3 3.844.0
- **Monitoring** : Prometheus + Grafana + AlertManager
- **Tests** : Jest + Supertest
- **Process Manager** : PM2
- **Containerisation** : Docker + Docker Compose

## 📦 Installation et Démarrage

### Prérequis

```bash
# Vérifier Node.js (version 18+ requise)
node --version
npm --version

# Installer les dépendances
npm install

# Vérifier l'installation
npm run lint
npm run type-check
```

### 🚀 Commandes de Développement

```bash
# Démarrer en mode développement (watch)
npm run start:dev

# Démarrer en mode debug
npm run start:debug

# Démarrer en mode production
npm run start:prod

# Construire l'application
npm run build

# Démarrer après build
npm run start
```

### 🐳 Docker

#### API Container

```bash
# Construire l'image Docker
docker build -t benevoclic-api .

# Exécuter le conteneur
docker run -p 3000:3000 benevoclic-api

# Exécuter avec docker-compose
docker-compose up -d

# Voir les logs
docker logs benevoclic-api --tail 50
```

#### MongoDB Local avec Docker Compose

```bash
# Démarrer MongoDB local
docker-compose up -d mongodb

# Vérifier que MongoDB fonctionne
docker ps | grep mongodb

# Se connecter à MongoDB
docker exec -it benevoclic-mongodb mongosh -u admin -p password123

# Voir les logs MongoDB
docker logs benevoclic-mongodb --tail 20

# Arrêter MongoDB
docker-compose down

# Supprimer les données MongoDB (attention!)
docker-compose down -v
```

#### Configuration MongoDB Local

```bash
# Variables d'environnement pour MongoDB local
export MONGODB_URL="mongodb://admin:password123@localhost:27017/benevoclic?authSource=admin"

# Ou créer un fichier .env.local
cat > .env.local << 'EOF'
# MongoDB Local
MONGODB_URL=mongodb://admin:password123@localhost:27017/benevoclic?authSource=admin

# Autres variables...
NODE_ENV=development
PORT=3000
EOF
```

## 🧪 Tests et Qualité

### Tests Unitaires

```bash
# Exécuter tous les tests
npm test

# Tests unitaires uniquement
npm run test:unit

# Tests d'intégration
npm run test:integration

# Tests en mode watch
npm run test:watch

# Tests avec couverture
npm run test:cov

# Tests de debug
npm run test:debug

# Tests end-to-end
npm run test:e2e

# Tests pour CI/CD
npm run test:ci
```

### Linting et Formatage

```bash
# Vérifier le code
npm run lint

# Corriger automatiquement
npm run lint:fix

# Formatage Prettier
npm run format

# Vérifier le formatage
npm run format:check

# Formatage complet
npm run format:fix
npm run prettier:fix
```

### Vérifications

```bash
# Vérifier Dependabot
npm run check:dependabot

# Vérification TypeScript
npx tsc --noEmit

# Vérifier les types
npm run type-check
```

## 🔧 Gestion des Processus (PM2)

### Commandes PM2

```bash
# Démarrer l'application
npm run pm2:start

# Démarrer en production
npm run pm2:start:prod

# Arrêter l'application
npm run pm2:stop

# Redémarrer l'application
npm run pm2:restart

# Recharger l'application (zero-downtime)
npm run pm2:reload

# Supprimer l'application
npm run pm2:delete

# Voir les logs
npm run pm2:logs

# Monitoring en temps réel
npm run pm2:monit

# Voir le statut
npm run pm2:status

# Déployer en production
npm run pm2:deploy
```

### Endpoints de Monitoring

```bash
# Health check
curl http://localhost:3000/health

# Métriques Prometheus
curl http://localhost:3000/metrics

# Swagger documentation
curl http://localhost:3000/api

# Vérifier la base de données
curl http://localhost:3000/health/db
```

### Problèmes Courants et Solutions

#### 1. API ne démarre pas

```bash
# Vérifier les logs PM2
npm run pm2:logs

# Vérifier les variables d'environnement
echo $MONGODB_URL
echo $FIREBASE_PROJECT_ID

# Redémarrer proprement
npm run pm2:stop
npm run pm2:start
```

#### 2. Erreur de connexion MongoDB

```bash
# Vérifier que MongoDB local fonctionne
docker ps | grep mongodb

# Vérifier la connexion MongoDB
docker exec benevoclic-mongodb mongosh -u admin -p password123 --eval "db.runCommand('ping')"

# Ou avec l'URL de connexion
mongo $MONGODB_URL --eval "db.runCommand('ping')"

# Redémarrer MongoDB si nécessaire
docker-compose restart mongodb

# Redémarrer avec logs détaillés
DEBUG=* npm run start:dev
```

#### 4. Monitoring ne fonctionne pas

```bash
# Redémarrer le stack de monitoring
npm run monitoring:stop
npm run monitoring:restart

# Vérifier les logs
npm run monitoring:logs

# Vérifier les métriques
curl http://localhost:3000/metrics
```

## 🔍 Debug et Logs

### Logs Détaillés

```bash
# Activer les logs de debug
DEBUG=* npm run start:dev

# Logs PM2 avec filtrage
pm2 logs benevoclic-api --lines 100 | grep -i "error\|warn"

# Logs Docker avec timestamp
docker logs benevoclic-api --timestamps --tail 50

# Logs de monitoring
docker-compose -f docker-compose.monitoring.yml logs -f
```

### Debug en Mode Développement

```bash
# Démarrer en mode debug
npm run start:debug

# Attacher le debugger
# Dans VS Code : F5 ou Debug > Start Debugging
# Dans Chrome : chrome://inspect
```

### Métriques et Performance

```bash
# Voir les métriques Prometheus
curl http://localhost:3000/metrics | grep -E "(http_requests_total|http_request_duration_seconds)"

# Vérifier les performances
curl -w "@curl-format.txt" -o /dev/null -s http://localhost:3000/health

# Créer le fichier de format curl
cat > curl-format.txt << 'EOF'
     time_namelookup:  %{time_namelookup}\n
        time_connect:  %{time_connect}\n
     time_appconnect:  %{time_appconnect}\n
    time_pretransfer:  %{time_pretransfer}\n
       time_redirect:  %{time_redirect}\n
  time_starttransfer:  %{time_starttransfer}\n
                     ----------\n
          time_total:  %{time_total}\n
EOF
```

## 🚀 Déploiement

### Déploiement Local

```bash
# Déployer l'API
npm run deploy:api

# Déployer le monitoring
npm run deploy:monitoring

# Déployer tout
npm run deploy:all
```

### Déploiement Production

```bash
# Via GitHub Actions (recommandé)
# 1. Push sur la branche main
# 2. Workflow automatique de déploiement

# Manuel sur le serveur
ssh user@server
cd /path/to/api
git pull origin main
npm install
npm run build
npm run pm2:reload
```

## 📊 Monitoring et Alertes

### Accès aux Interfaces

- **API Health** : http://localhost:3000/health
- **Prometheus** : http://localhost:9090
- **AlertManager** : http://localhost:9093
- **Grafana** : http://localhost:3001 (admin/admin123)
- **Swagger** : http://localhost:3000/api

### Métriques Clés

```bash
# Requêtes par seconde
curl -s http://localhost:9090/api/v1/query?query=rate\(http_requests_total\[5m\]\)

# Temps de réponse moyen
curl -s http://localhost:9090/api/v1/query?query=rate\(http_request_duration_seconds_sum\[5m\]\)/rate\(http_request_duration_seconds_count\[5m\]\)

# Taux d'erreurs
curl -s http://localhost:9090/api/v1/query?query=rate\(http_requests_total\{status=~\"5..\"\}\[5m\]\)/rate\(http_requests_total\[5m\]\)

```

### Alertes Configurées

- **ServerDown** : API arrêtée
- **HighErrorRate** : Taux d'erreurs élevé
- **HighResponseTime** : Temps de réponse élevé
- **HighMemoryUsage** : Utilisation mémoire élevée
- **HighCPUUsage** : Utilisation CPU élevée

## 🔧 Configuration Avancée

### Variables d'Environnement

```bash
# Créer le fichier .env
cat > .env << 'EOF'
# Base de données
MONGODB_URL=mongodb://localhost:27017/benevoclic

# Firebase
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_CLIENT_EMAIL=your-client-email

# AWS S3
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=eu-west-3
AWS_S3_BUCKET=your-bucket-name

# Application
NODE_ENV=production
PORT=3000
API_BASE_URL=http://localhost:3000

# Monitoring
PROMETHEUS_PORT=9090
GRAFANA_PORT=3001
ALERTMANAGER_PORT=9093
EOF
```

### Configuration PM2

```bash
# Voir la configuration PM2
cat ecosystem.config.js

# Modifier la configuration
nano ecosystem.config.js
```

## 🆘 Support

### Commandes d'Aide

```bash
# Afficher toutes les commandes disponibles
npm run

# Aide PM2
pm2 --help

# Aide Docker
docker --help

# Vérifier la configuration
npm run lint
npm run type-check
```

### Logs et Debug

```bash
# Logs détaillés PM2
pm2 logs benevoclic-api --lines 200

# Logs avec timestamp
pm2 logs benevoclic-api --timestamp

# Logs d'erreurs uniquement
pm2 logs benevoclic-api --err

# Logs Docker détaillés
docker logs benevoclic-api --tail 100 --follow
```

### Contact et Support

- **Documentation** : Voir les guides dans le repo `/benevoclic-docs`
- **Issues** : GitHub Issues du repository
- **Monitoring** : Grafana dashboards
- **Alertes** : Discord notifications

---


**🎯 Version actuelle : 0.9.0** | **🚀 Prêt pour la production** | **🔒 Sécurisé et optimisé**

