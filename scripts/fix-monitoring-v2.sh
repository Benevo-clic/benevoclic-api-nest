#!/bin/bash

echo "🔧 Correction complète de la configuration monitoring..."

# 1. Nettoyer les conteneurs existants
echo "🛑 Nettoyage des conteneurs..."
docker stop prometheus grafana node-exporter benevoclic-api 2>/dev/null || true
docker rm prometheus grafana node-exporter 2>/dev/null || true

# 2. Créer le réseau s'il n'existe pas
echo "🌐 Création du réseau..."
docker network create benevoclic-network 2>/dev/null || true

# 3. Redémarrer l'API d'abord
echo "🚀 Redémarrage de l'API..."
docker compose up -d

# 4. Redémarrer le monitoring
echo "📊 Redémarrage du monitoring..."
docker compose -f docker-compose.monitoring.yml up -d

# 5. Attendre que les services démarrent
echo "⏳ Attente du démarrage..."
sleep 20

# 6. Vérifier les logs
echo "📝 Vérification des logs..."
echo "=== Logs API ==="
docker logs benevoclic-api --tail 5

echo "=== Logs Prometheus ==="
docker logs prometheus --tail 5

echo "=== Logs Grafana ==="
docker logs grafana --tail 5

# 7. Tester les endpoints
echo "🔍 Test des endpoints..."
echo "API metrics:"
curl -s http://localhost:3000/metrics | head -3

echo "Prometheus targets:"
curl -s http://localhost:9090/api/v1/targets

echo "Vérification du réseau:"
docker network inspect benevoclic-network

echo "✅ Configuration corrigée !"
echo "📊 Accédez à http://151.80.152.63:3001"
echo "🔍 Vérifiez les targets dans Prometheus: http://151.80.152.63:9090/targets" 