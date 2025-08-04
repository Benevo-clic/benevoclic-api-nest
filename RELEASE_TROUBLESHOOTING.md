# 🔧 Guide de Dépannage - Workflow de Release

## 📋 Vue d'ensemble

Ce guide vous aide à résoudre les problèmes courants avec le workflow de release.

## 🚨 Erreur "exit code 128" - Permission denied

### **Erreur :**
```
remote: Permission to Benevo-clic/benevoclic-api-nest.git denied to github-actions[bot].
fatal: unable to access 'https://github.com/Benevo-clic/benevoclic-api-nest/': The requested URL returned error: 403
```

### **Cause :**
Le token GitHub n'a pas les bonnes permissions pour pousser des changements vers le repository.

### **Solutions :**

#### **1. Configurer les Permissions Repository (OBLIGATOIRE)**
```bash
# Aller sur GitHub → Settings → Actions → General
# Configurer :
# - Workflow permissions: "Read and write permissions"
# - Allow GitHub Actions to create and approve pull requests: ✅
```

#### **2. Utiliser le Token Par Défaut (Recommandé)**
```yaml
# Dans le workflow, utiliser le token par défaut :
token: ${{ secrets.GITHUB_TOKEN }}

# Permissions ajoutées :
permissions:
  contents: write
  actions: read
  id-token: write
```

#### **3. Vérifier les Secrets GitHub**
```bash
# Aller sur GitHub → Settings → Secrets and variables → Actions
# Vérifier que ces secrets sont définis :
# - VPS_HOST
# - VPS_USERNAME  
# - OVH_SSH_KEY
# - WEBHOOK_URL

# Note : GITHUB_TOKEN est automatique, pas besoin de le configurer
```

## 🔍 Diagnostic des Problèmes

### **1. Utiliser le Script de Test**
```bash
# Exécuter le script de test pour diagnostiquer
./scripts/test-release.sh
```

### **2. Vérifier les Logs GitHub Actions**
```bash
# Aller sur GitHub → Actions → Release Management
# Cliquer sur le workflow qui a échoué
# Vérifier les logs de chaque étape
```

### **3. Vérifier l'État du Repository**
```bash
# Vérifier que le repository est propre
git status

# Vérifier la branche actuelle
git branch --show-current

# Vérifier les tags existants
git tag --sort=-version:refname
```

## 🛠️ Corrections Apportées

### **1. Permissions Ajoutées**
```yaml
permissions:
  contents: write
  actions: read
  id-token: write
```

### **2. Token Par Défaut Utilisé**
```yaml
# Au lieu de TOKEN_GITHUB, utiliser GITHUB_TOKEN
token: ${{ secrets.GITHUB_TOKEN }}
```

### **3. Configuration Git Automatique**
```yaml
- name: Configure Git
  run: |
    git config --local user.email "github-actions[bot]@users.noreply.github.com"
    git config --local user.name "github-actions[bot]"
```

### **4. Séparation des Étapes**
```yaml
# Commit et push séparés
- name: Commit and push changes
  run: |
    git add package.json CHANGELOG.md
    git commit -m "chore: bump version to ${{ steps.bump.outputs.new_version }}"
    git push origin main

- name: Create Git tag
  run: |
    git tag -a "v${{ steps.bump.outputs.new_version }}" -m "Release v${{ steps.bump.outputs.new_version }}"
    git push origin "v${{ steps.bump.outputs.new_version }}"
```

## 🚨 Problèmes Courants

### **1. Erreur "Permission denied" (403)**
```bash
# Cause : Permissions GitHub insuffisantes
# Solution : Configurer les permissions repository
# 1. Aller sur GitHub → Settings → Actions → General
# 2. Workflow permissions: "Read and write permissions"
# 3. Allow GitHub Actions to create and approve pull requests: ✅
```

### **2. Erreur "Token not found"**
```bash
# Cause : Token manquant ou incorrect
# Solution : Utiliser GITHUB_TOKEN (automatique)
# Ne pas utiliser TOKEN_GITHUB personnalisé
```

### **3. Erreur "Tag already exists"**
```bash
# Cause : Le tag existe déjà
# Solution : Supprimer le tag existant ou incrémenter la version
git tag -d v1.1.0
git push origin :refs/tags/v1.1.0
```

### **4. Erreur "Branch not found"**
```bash
# Cause : Branche principale différente
# Solution : Vérifier le nom de la branche (main vs master)
git branch --show-current
```

## 🔧 Configuration Requise

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
# Ajouter les secrets suivants :

VPS_HOST          # IP de votre serveur (ex: 151.80.152.63)
VPS_USERNAME      # Utilisateur SSH (ex: debian)
OVH_SSH_KEY       # Clé SSH privée
WEBHOOK_URL       # URL du webhook Discord

# Note : GITHUB_TOKEN est automatique
```

### **3. Configuration Repository**
```bash
# Vérifier que le repository est sur la branche principale
git checkout main

# Vérifier que tous les changements sont commités
git status

# Vérifier que le CHANGELOG.md existe
ls -la CHANGELOG.md
```

## 📊 Test du Workflow

### **1. Test Manuel**
```bash
# Exécuter le script de test
./scripts/test-release.sh

# Vérifier les résultats
echo "Test terminé"
```

### **2. Test via GitHub Actions**
```bash
# Aller sur GitHub → Actions → Release Management
# Cliquer "Run workflow"
# Choisir le type de release (patch/minor/major)
# Cliquer "Run workflow"
```

### **3. Vérification Post-Test**
```bash
# Vérifier que la version a été mise à jour
npm version

# Vérifier que le CHANGELOG.md a été mis à jour
cat CHANGELOG.md

# Vérifier que le tag a été créé
git tag --sort=-version:refname
```

## 🔄 Workflow Corrigé

### **Étapes du Workflow :**
1. **Checkout** - Récupération du code
2. **Setup Node.js** - Configuration de l'environnement
3. **Configure Git** - Configuration automatique de Git
4. **Bump version** - Calcul de la nouvelle version
5. **Update package.json** - Mise à jour de la version
6. **Generate CHANGELOG entry** - Génération de l'entrée CHANGELOG
7. **Commit and push changes** - Commit et push des changements
8. **Create Git tag** - Création du tag Git
9. **Create Release** - Création de la release GitHub

### **Jobs Automatiques :**
- **deploy-release** - Déploiement automatique lors d'un tag
- **generate-release-notes** - Génération des release notes

## 🚀 Utilisation

### **1. Release Manuelle**
```bash
# Aller sur GitHub → Actions → Release Management
# Cliquer "Run workflow"
# Choisir le type de release
# Cliquer "Run workflow"
```

### **2. Release via Tag**
```bash
# Créer un tag manuellement
git tag -a v1.1.0 -m "Release v1.1.0"
git push origin v1.1.0

# Le workflow se déclenche automatiquement
```

### **3. Vérification**
```bash
# Vérifier que la release a été créée
# Aller sur GitHub → Releases

# Vérifier que le déploiement a eu lieu
curl http://IP_VPS:3000/health

# Vérifier la notification Discord
# Vérifier le canal Discord
```

## 📞 Support

### **En cas de problème persistant :**
1. **Vérifier les permissions** repository (OBLIGATOIRE)
2. **Exécuter le script de test** `./scripts/test-release.sh`
3. **Vérifier la configuration** GitHub
4. **Consulter la documentation** complète
5. **Vérifier les logs** GitHub Actions

### **Logs utiles :**
```bash
# Logs du workflow
GitHub → Actions → Release Management → [Workflow] → [Job] → [Step]

# Logs de déploiement
ssh debian@IP_VPS
cd ~/benevoclic
pm2 logs benevoclic-api
```

## 📚 Documentation Complète

### **Guides Disponibles :**
- **[GITHUB_PERMISSIONS_GUIDE.md](GITHUB_PERMISSIONS_GUIDE.md)** - Guide des permissions GitHub
- **[RELEASE_TROUBLESHOOTING.md](RELEASE_TROUBLESHOOTING.md)** - Guide de dépannage
- **[VERSIONING_GUIDE.md](VERSIONING_GUIDE.md)** - Guide de versioning
- **[QUICK_START_VERSIONING.md](QUICK_START_VERSIONING.md)** - Guide de démarrage rapide

---

## 🎯 Résumé des Corrections

### **✅ Problèmes Résolus :**
- **Permissions Git** - Configuration automatique
- **Permissions GitHub** - Ajout des permissions nécessaires
- **Token GitHub** - Utilisation du token par défaut
- **Gestion des erreurs** - Meilleure gestion des cas d'erreur
- **Séparation des étapes** - Commit et tag séparés

### **✅ Améliorations :**
- **Script de test** - Diagnostic automatique
- **Meilleure documentation** - Guide de dépannage
- **Configuration robuste** - Gestion des cas limites
- **Logs détaillés** - Meilleur debugging

### **⚠️ Configuration OBLIGATOIRE :**
```bash
# Aller sur GitHub → Settings → Actions → General
# Configurer :
# - Workflow permissions: "Read and write permissions"
# - Allow GitHub Actions to create and approve pull requests: ✅
```

**🚀 Le workflow de release devrait maintenant fonctionner correctement !** 