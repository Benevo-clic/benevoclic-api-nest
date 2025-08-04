# 🔄 Guide du Workflow de Release - Benevoclic

## 📋 Vue d'ensemble

Ce guide explique le fonctionnement du workflow de release corrigé qui résout le problème des jobs skipés.

## 🚨 Problème Résolu

### **Problème Initial :**
- ✅ **create-release** - Réussit (15s)
- ❌ **deploy-release** - Skipé
- ❌ **generate-release-notes** - Skipé

### **Cause :**
Les jobs `deploy-release` et `generate-release-notes` ne se déclenchaient que lors d'un push de tag (`v*`), mais le job `create-release` ne déclenchait pas automatiquement ces jobs.

## ✅ Solution Implémentée

### **1. Conditions de Déclenchement Corrigées**

#### **Avant :**
```yaml
deploy-release:
  if: github.event_name == 'push' && startsWith(github.ref, 'refs/tags/v')

generate-release-notes:
  if: github.event_name == 'push' && startsWith(github.ref, 'refs/tags/v')
```

#### **Après :**
```yaml
deploy-release:
  if: (github.event_name == 'push' && startsWith(github.ref, 'refs/tags/v')) || (github.event_name == 'workflow_dispatch')

generate-release-notes:
  if: (github.event_name == 'push' && startsWith(github.ref, 'refs/tags/v')) || (github.event_name == 'workflow_dispatch')
```

### **2. Dépendances Ajoutées**

#### **Avant :**
```yaml
deploy-release:
  needs: []

generate-release-notes:
  needs: []
```

#### **Après :**
```yaml
deploy-release:
  needs: create-release

generate-release-notes:
  needs: create-release
```

### **3. Outputs Ajoutés**

#### **Job create-release :**
```yaml
create-release:
  outputs:
    new_version: ${{ steps.bump.outputs.new_version }}
```

### **4. Extraction de Version Intelligente**

#### **Job deploy-release :**
```bash
if [ "${{ github.event_name }}" = "workflow_dispatch" ]; then
  VERSION="${{ needs.create-release.outputs.new_version }}"
else
  VERSION=${GITHUB_REF#refs/tags/v}
fi
```

#### **Job generate-release-notes :**
```bash
if [ "${{ github.event_name }}" = "workflow_dispatch" ]; then
  VERSION="${{ needs.create-release.outputs.new_version }}"
else
  VERSION=${GITHUB_REF#refs/tags/v}
fi
```

## 🔄 Nouveau Fonctionnement

### **1. Déclenchement via workflow_dispatch**

#### **Étapes :**
1. **create-release** - Crée la release et le tag
2. **deploy-release** - Déploie automatiquement (dépend de create-release)
3. **generate-release-notes** - Génère les notes (dépend de create-release)

#### **Séquence :**
```bash
# 1. Aller sur GitHub → Actions → Release Management
# 2. Cliquer "Run workflow"
# 3. Choisir le type de release (patch/minor/major)
# 4. Cliquer "Run workflow"
# 5. Tous les jobs s'exécutent automatiquement
```

### **2. Déclenchement via push de tag**

#### **Étapes :**
1. **deploy-release** - Déploie automatiquement
2. **generate-release-notes** - Génère les notes

#### **Séquence :**
```bash
# 1. Créer un tag manuellement
git tag -a v1.1.0 -m "Release v1.1.0"
git push origin v1.1.0

# 2. Les jobs se déclenchent automatiquement
```

## 📊 Résultat Attendu

### **✅ Workflow Réussi :**
- ✅ **create-release** - Réussit (15s)
- ✅ **deploy-release** - Réussit (déploiement automatique)
- ✅ **generate-release-notes** - Réussit (notes générées)

### **✅ Actions Automatiques :**
- 📦 **Version bumpée** dans package.json
- 📝 **CHANGELOG.md** mis à jour
- 🏷️ **Tag Git** créé et poussé
- 🚀 **Release GitHub** créée
- 🔄 **Déploiement automatique** sur le serveur
- 📊 **Notification Discord** envoyée
- 📋 **Release notes** générées

## 🛠️ Configuration Requise

### **1. Permissions Repository (OBLIGATOIRE)**
```bash
# Aller sur GitHub → Settings → Actions → General
# Configurer :
# - Workflow permissions: "Read and write permissions"
# - Allow GitHub Actions to create and approve pull requests: ✅
```

### **2. Secrets GitHub**
```bash
# Aller sur GitHub → Settings → Secrets and variables → Actions
# Vérifier que ces secrets sont définis :

VPS_HOST          # IP de votre serveur
VPS_USERNAME      # Utilisateur SSH
OVH_SSH_KEY       # Clé SSH privée
WEBHOOK_URL       # URL du webhook Discord
```

## 🚀 Utilisation

### **1. Release Manuelle (Recommandé)**

#### **Étapes :**
```bash
# 1. Aller sur GitHub → Actions
# 2. Sélectionner "Release Management"
# 3. Cliquer "Run workflow"
# 4. Choisir le type de release :
#    - patch (1.0.0 → 1.0.1)
#    - minor (1.0.0 → 1.1.0)
#    - major (1.0.0 → 2.0.0)
# 5. Cliquer "Run workflow"
# 6. Attendre que tous les jobs se terminent
```

#### **Résultat :**
- ✅ Version bumpée automatiquement
- ✅ CHANGELOG.md mis à jour
- ✅ Tag Git créé
- ✅ Release GitHub créée
- ✅ Déploiement automatique
- ✅ Notification Discord
- ✅ Release notes générées

### **2. Release via Tag**

#### **Étapes :**
```bash
# 1. Créer un tag manuellement
git tag -a v1.1.0 -m "Release v1.1.0"
git push origin v1.1.0

# 2. Les jobs se déclenchent automatiquement
```

#### **Résultat :**
- ✅ Déploiement automatique
- ✅ Notification Discord
- ✅ Release notes générées

## 📊 Monitoring

### **1. Vérification Post-Release**

#### **Vérifications :**
```bash
# 1. Vérifier la release GitHub
# Aller sur GitHub → Releases

# 2. Vérifier le déploiement
curl http://IP_VPS:3000/health

# 3. Vérifier la notification Discord
# Vérifier le canal Discord

# 4. Vérifier les logs
# Aller sur GitHub → Actions → Release Management
```

### **2. Logs Utiles**

#### **Logs de Déploiement :**
```bash
# Se connecter au serveur
ssh debian@IP_VPS

# Vérifier les logs PM2
pm2 logs benevoclic-api

# Vérifier le statut
pm2 status
```

#### **Logs GitHub Actions :**
```bash
# Aller sur GitHub → Actions → Release Management
# Cliquer sur le workflow récent
# Vérifier les logs de chaque job
```

## 🔧 Dépannage

### **1. Jobs Toujours Skipés**

#### **Vérifications :**
```bash
# 1. Vérifier les permissions repository
# Aller sur GitHub → Settings → Actions → General

# 2. Vérifier les secrets GitHub
# Aller sur GitHub → Settings → Secrets and variables → Actions

# 3. Exécuter le script de test
./scripts/test-release.sh
```

### **2. Erreur de Déploiement**

#### **Vérifications :**
```bash
# 1. Vérifier les secrets SSH
# 2. Vérifier la connectivité SSH
# 3. Vérifier les logs de déploiement
# 4. Vérifier le statut PM2
```

### **3. Erreur de Notification Discord**

#### **Vérifications :**
```bash
# 1. Vérifier le secret WEBHOOK_URL
# 2. Tester le webhook manuellement
# 3. Vérifier les permissions Discord
```

## 📚 Documentation Complète

### **Guides Disponibles :**
- **[GITHUB_PERMISSIONS_GUIDE.md](GITHUB_PERMISSIONS_GUIDE.md)** - Guide des permissions GitHub
- **[RELEASE_TROUBLESHOOTING.md](RELEASE_TROUBLESHOOTING.md)** - Guide de dépannage
- **[VERSIONING_GUIDE.md](VERSIONING_GUIDE.md)** - Guide de versioning
- **[QUICK_START_VERSIONING.md](QUICK_START_VERSIONING.md)** - Guide de démarrage rapide

---

## 🎯 Résumé des Améliorations

### **✅ Problèmes Résolus :**
- **Jobs skipés** - Conditions de déclenchement corrigées
- **Dépendances manquantes** - Ajout des besoins entre jobs
- **Extraction de version** - Intelligente selon le contexte
- **Workflow complet** - Tous les jobs s'exécutent automatiquement

### **✅ Avantages :**
- **Automatisation complète** - Release → Déploiement → Notification
- **Flexibilité** - Support des deux modes de déclenchement
- **Robustesse** - Gestion des erreurs et dépendances
- **Monitoring** - Logs détaillés et notifications

### **✅ Fonctionnalités :**
- **Versioning automatique** - Bump de version intelligent
- **CHANGELOG automatique** - Mise à jour automatique
- **Déploiement automatique** - Déploiement sur le serveur
- **Notifications automatiques** - Discord et GitHub
- **Release notes automatiques** - Génération depuis le CHANGELOG

**🚀 Le workflow de release fonctionne maintenant de manière complète et automatique !** 