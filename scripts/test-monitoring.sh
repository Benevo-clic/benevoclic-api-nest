#!/bin/bash

echo "🔍 Test du monitoring BenevoClic..."

# 1. Vérifier les conteneurs
echo "📦 Statut des conteneurs :"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# 2. Tester l'API
echo ""
echo "🔌 Test de l'API :"
echo "Health check:"
curl -s http://localhost:3000/health | jq . 2>/dev/null || curl -s http://localhost:3000/health

echo ""
echo "Metrics endpoint:"
curl -s http://localhost:3000/metrics | head -5

# 3. Tester Prometheus
echo ""
echo "📊 Test de Prometheus :"
echo "Targets:"
curl -s http://localhost:9090/api/v1/targets | jq '.data.activeTargets[] | {job: .labels.job, health: .health, lastError: .lastError}' 2>/dev/null || curl -s http://localhost:9090/api/v1/targets

echo ""
echo "Métriques collectées:"
curl -s "http://localhost:9090/api/v1/query?query=up" | jq '.data.result[] | {job: .metric.job, instance: .metric.instance, value: .value[1]}' 2>/dev/null || curl -s "http://localhost:9090/api/v1/query?query=up"

# 4. Tester Grafana
echo ""
echo "📈 Test de Grafana :"
echo "Statut:"
curl -s http://localhost:3001/api/health | jq . 2>/dev/null || curl -s http://localhost:3001/api/health

# 5. Vérifier le réseau
echo ""
echo "🌐 Réseau Docker :"
docker network inspect benevoclic-network --format "table {{.Name}}\t{{.Driver}}\t{{.IPAM.Config}}"

# 6. Vérifier les logs récents
echo ""
echo "📝 Logs récents :"
echo "=== API ==="
docker logs benevoclic-api --tail 3 2>/dev/null || echo "Conteneur API non trouvé"

echo ""
echo "=== Prometheus ==="
docker logs prometheus --tail 3 2>/dev/null || echo "Conteneur Prometheus non trouvé"

echo ""
echo "=== Grafana ==="
docker logs grafana --tail 3 2>/dev/null || echo "Conteneur Grafana non trouvé"

echo ""
echo "✅ Test terminé !"
echo "📊 Accédez à :"
echo "   - Grafana: http://151.80.152.63:3001"
echo "   - Prometheus: http://151.80.152.63:9090"
echo "   - API: http://151.80.152.63:3000" 