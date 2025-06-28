# Guide de déploiement Redis avec NestJS

## Configuration Redis pour BeneVoclic API

### 1. Variables d'environnement

#### Développement local (.env)
```bash
# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_TTL=300
REDIS_DB=0
```

#### Production (OVH VPS)
```bash
# Redis Configuration
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=your-secure-password
REDIS_TTL=300
REDIS_DB=0
```

### 2. Déploiement local avec Docker Compose

```bash
# Cloner le projet
git clone <repository-url>
cd benevoclic-api-nest

# Copier le fichier d'environnement
cp env.example .env
# Éditer .env avec vos valeurs

# Démarrer les services
docker-compose up -d

# Vérifier les logs
docker-compose logs -f
```

### 3. Déploiement sur OVH VPS

#### Option A: Docker Compose (Recommandé)
```bash
# Sur le VPS
mkdir -p ~/benevoclic
cd ~/benevoclic

# Créer le docker-compose.yml (voir fichier dans le repo)
# Ajouter les variables d'environnement dans un fichier .env

# Démarrer les services
docker-compose up -d

# Vérifier le statut
docker-compose ps
docker-compose logs -f
```

#### Option B: Docker run séparé
```bash
# Créer le réseau
docker network create benevoclic-network

# Démarrer Redis
docker run -d \
  --name benevoclic-redis \
  --network benevoclic-network \
  -p 6379:6379 \
  -v redis_data:/data \
  --restart always \
  redis:7-alpine \
  redis-server --appendonly yes --requirepass your-secure-password

# Démarrer l'API
docker run -d \
  --name benevoclic-api \
  --network benevoclic-network \
  -p 3000:3000 \
  --restart always \
  -e REDIS_HOST=benevoclic-redis \
  -e REDIS_PORT=6379 \
  -e REDIS_PASSWORD=your-secure-password \
  -e REDIS_TTL=300 \
  -e REDIS_DB=0 \
  -e MONGODB_URL=your-mongodb-url \
  -e FIREBASE_CLIENT_EMAIL=your-firebase-email \
  -e FIREBASE_PRIVATE_KEY=your-firebase-key \
  -e FIREBASE_PROJECT_ID=your-project-id \
  -e FIREBASE_API_KEY=your-api-key \
  your-dockerhub-username/benevoclic-api:latest
```

### 4. Configuration GitHub Actions

Ajouter ces secrets dans votre repository GitHub :

- `REDIS_PASSWORD`: Mot de passe Redis sécurisé
- `REDIS_TTL`: TTL du cache (défaut: 300)
- `REDIS_DB`: Base de données Redis (défaut: 0)

### 5. Vérification du déploiement

#### Test de santé
```bash
curl http://localhost:3000/health
```

Réponse attendue :
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "cache": "connected"
}
```

#### Test du cache
```bash
# Premier appel (cache miss)
curl http://localhost:3000/api/announcements

# Deuxième appel (cache hit)
curl http://localhost:3000/api/announcements
```

### 6. Monitoring Redis

#### Connexion à Redis CLI
```bash
# Local
redis-cli

# Avec Docker
docker exec -it benevoclic-redis redis-cli

# Avec mot de passe
docker exec -it benevoclic-redis redis-cli -a your-password
```

#### Commandes utiles
```bash
# Voir les clés en cache
KEYS *

# Voir la taille du cache
DBSIZE

# Voir les statistiques
INFO memory

# Vider le cache
FLUSHDB
```

### 7. Troubleshooting

#### Problèmes courants

1. **Connexion Redis échouée**
   - Vérifier que Redis est démarré
   - Vérifier les variables d'environnement
   - Vérifier le réseau Docker

2. **Cache non fonctionnel**
   - Vérifier les logs de l'application
   - Tester la connexion Redis manuellement
   - Vérifier les permissions

3. **Performance dégradée**
   - Vérifier la mémoire Redis
   - Ajuster le TTL
   - Monitorer les hits/misses

#### Logs utiles
```bash
# Logs de l'API
docker-compose logs api

# Logs de Redis
docker-compose logs redis

# Logs en temps réel
docker-compose logs -f
```

### 8. Sécurité

- Utilisez un mot de passe fort pour Redis en production
- Limitez l'accès réseau à Redis
- Utilisez des volumes persistants pour les données
- Surveillez les tentatives de connexion

### 9. Performance

- TTL recommandé : 300 secondes (5 minutes)
- Monitorer les hits/misses du cache
- Ajuster la mémoire Redis selon l'usage
- Utiliser la persistance Redis pour la récupération après redémarrage 