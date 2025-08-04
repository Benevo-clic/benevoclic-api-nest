# 🔧 Guide de Configuration des Permissions GitHub - Benevoclic

## 📋 Vue d'ensemble

Ce guide vous aide à configurer correctement les permissions GitHub Actions pour que le workflow de release fonctionne.

## 🚨 Problème "Permission denied"

### **Erreur :**
```
remote: Permission to Benevo-clic/benevoclic-api-nest.git denied to github-actions[bot].
fatal: unable to access 'https://github.com/Benevo-clic/benevoclic-api-nest/': The requested URL returned error: 403
```

### **Cause :**
Le token GitHub n'a pas les bonnes permissions pour pousser des changements vers le repository.

## 🔧 Solutions

### **1. Utiliser le Token Par Défaut (Recommandé)**

#### **Configuration du Workflow :**
```yaml
# Dans .github/workflows/release.yml
permissions:
  contents: write
  actions: read
  id-token: write

steps:
  - name: Checkout code
    uses: actions/checkout@v4
    with:
      fetch-depth: 0
      token: ${{ secrets.GITHUB_TOKEN }}  # Token par défaut
```

#### **Avantages :**
- ✅ **Automatique** - Pas besoin de configuration manuelle
- ✅ **Sécurisé** - Permissions limitées au repository
- ✅ **Gratuit** - Pas de quota limité
- ✅ **Maintenu** - Mise à jour automatique

### **2. Configurer les Permissions Repository**

#### **Étapes :**
1. **Aller sur GitHub** → Votre repository
2. **Settings** → Actions → General
3. **Workflow permissions** → "Read and write permissions"
4. **Allow GitHub Actions to create and approve pull requests** → ✅ Activé
5. **Save**

#### **Configuration :**
```bash
# Dans GitHub → Settings → Actions → General
Workflow permissions: Read and write permissions
Allow GitHub Actions to create and approve pull requests: ✅
```

### **3. Vérifier les Secrets GitHub**

#### **Secrets Requis :**
```bash
# Aller sur GitHub → Settings → Secrets and variables → Actions
# Vérifier que ces secrets sont définis :

VPS_HOST          # IP de votre serveur (ex: 151.80.152.63)
VPS_USERNAME      # Utilisateur SSH (ex: debian)
OVH_SSH_KEY       # Clé SSH privée
WEBHOOK_URL       # URL du webhook Discord
```

#### **Note :**
- **GITHUB_TOKEN** est automatique, pas besoin de le configurer
- **TOKEN_GITHUB** n'est plus nécessaire

## 🛠️ Configuration Complète

### **1. Permissions Repository**

#### **Étapes de Configuration :**
```bash
# 1. Aller sur GitHub
https://github.com/Benevo-clic/benevoclic-api-nest

# 2. Cliquer Settings
# 3. Cliquer Actions dans le menu de gauche
# 4. Cliquer General
# 5. Dans "Workflow permissions" :
#    - Sélectionner "Read and write permissions"
# 6. Dans "Allow GitHub Actions to create and approve pull requests" :
#    - Cocher la case
# 7. Cliquer Save
```

#### **Vérification :**
```bash
# Vérifier que les permissions sont correctes
# Le workflow devrait maintenant pouvoir :
# - Pousser des commits
# - Créer des tags
# - Créer des releases
```

### **2. Configuration du Workflow**

#### **Workflow Corrigé :**
```yaml
name: Release Management

on:
  workflow_dispatch:
    inputs:
      release_type:
        description: 'Type de release'
        required: true
        default: 'patch'
        type: choice
        options:
          - patch
          - minor
          - major

permissions:
  contents: write
  actions: read
  id-token: write

jobs:
  create-release:
    if: github.event_name == 'workflow_dispatch'
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        with:
          fetch-depth: 0
          token: ${{ secrets.GITHUB_TOKEN }}  # Token par défaut

      - name: Configure Git
        run: |
          git config --local user.email "github-actions[bot]@users.noreply.github.com"
          git config --local user.name "github-actions[bot]"

      # ... autres étapes
```

### **3. Test de Configuration**

#### **Script de Test :**
```bash
# Exécuter le script de test
./scripts/test-release.sh

# Vérifier les résultats
echo "Configuration testée"
```

#### **Test Manuel :**
```bash
# 1. Aller sur GitHub → Actions
# 2. Sélectionner "Release Management"
# 3. Cliquer "Run workflow"
# 4. Choisir le type de release
# 5. Cliquer "Run workflow"
# 6. Vérifier que le workflow réussit
```

## 🔍 Diagnostic des Problèmes

### **1. Vérifier les Permissions**

#### **Commande de Test :**
```bash
# Vérifier les permissions du repository
curl -H "Authorization: token $GITHUB_TOKEN" \
  https://api.github.com/repos/Benevo-clic/benevoclic-api-nest
```

#### **Vérification Visuelle :**
```bash
# Aller sur GitHub → Settings → Actions → General
# Vérifier que :
# - Workflow permissions = "Read and write permissions"
# - Allow GitHub Actions to create and approve pull requests = ✅
```

### **2. Vérifier les Logs**

#### **Logs GitHub Actions :**
```bash
# Aller sur GitHub → Actions → Release Management
# Cliquer sur le workflow qui a échoué
# Vérifier les logs de chaque étape
# Chercher les erreurs de permission
```

#### **Logs Utiles :**
```bash
# Logs de checkout
- name: Checkout code
  uses: actions/checkout@v4

# Logs de commit
- name: Commit and push changes
  run: |
    git add package.json CHANGELOG.md
    git commit -m "chore: bump version to ${{ steps.bump.outputs.new_version }}"
    git push origin main

# Logs de tag
- name: Create Git tag
  run: |
    git tag -a "v${{ steps.bump.outputs.new_version }}" -m "Release v${{ steps.bump.outputs.new_version }}"
    git push origin "v${{ steps.bump.outputs.new_version }}"
```

### **3. Problèmes Courants**

#### **Erreur 403 :**
```bash
# Cause : Permissions insuffisantes
# Solution : Configurer les permissions repository
```

#### **Erreur "Token not found" :**
```bash
# Cause : Token manquant
# Solution : Utiliser GITHUB_TOKEN (automatique)
```

#### **Erreur "Branch not found" :**
```bash
# Cause : Branche principale différente
# Solution : Vérifier le nom de la branche (main vs master)
```

## 🚀 Utilisation

### **1. Configuration Initiale**

#### **Étapes :**
```bash
# 1. Configurer les permissions repository
# 2. Vérifier les secrets GitHub
# 3. Tester le workflow
# 4. Vérifier les résultats
```

#### **Vérification :**
```bash
# Exécuter le script de test
./scripts/test-release.sh

# Vérifier que tous les tests passent
echo "Configuration validée"
```

### **2. Utilisation Quotidienne**

#### **Release Manuelle :**
```bash
# 1. Aller sur GitHub → Actions
# 2. Sélectionner "Release Management"
# 3. Cliquer "Run workflow"
# 4. Choisir le type de release
# 5. Cliquer "Run workflow"
```

#### **Release via Tag :**
```bash
# Créer un tag manuellement
git tag -a v1.1.0 -m "Release v1.1.0"
git push origin v1.1.0

# Le workflow se déclenche automatiquement
```

### **3. Vérification Post-Release**

#### **Vérifications :**
```bash
# 1. Vérifier que la release a été créée
# Aller sur GitHub → Releases

# 2. Vérifier que le déploiement a eu lieu
curl http://IP_VPS:3000/health

# 3. Vérifier la notification Discord
# Vérifier le canal Discord

# 4. Vérifier les logs
# Aller sur GitHub → Actions → Release Management
```

## 📊 Monitoring

### **1. Métriques de Succès**

#### **Indicateurs :**
- ✅ **Workflow réussit** sans erreur 403
- ✅ **Release créée** automatiquement
- ✅ **Tag Git** créé et poussé
- ✅ **Déploiement** automatique réussi
- ✅ **Notification Discord** envoyée

### **2. Logs de Debugging**

#### **Logs Utiles :**
```bash
# Logs de permission
echo "Permissions vérifiées"

# Logs de token
echo "Token GitHub valide"

# Logs de commit
echo "Commit et push réussis"

# Logs de tag
echo "Tag créé et poussé"
```

## 🔧 Dépannage Avancé

### **1. Problème Persistant**

#### **Solutions :**
```bash
# 1. Vérifier les permissions repository
# 2. Vérifier les secrets GitHub
# 3. Vérifier la configuration Git
# 4. Vérifier les logs détaillés
# 5. Contacter le support GitHub si nécessaire
```

### **2. Configuration Alternative**

#### **Si le token par défaut ne fonctionne pas :**
```yaml
# Créer un Personal Access Token
# Aller sur GitHub → Settings → Developer settings → Personal access tokens
# Créer un token avec les permissions :
# - repo (full control of private repositories)
# - workflow (update GitHub Action workflows)

# Ajouter le token comme secret :
# GitHub → Settings → Secrets and variables → Actions
# Ajouter : GITHUB_TOKEN_CUSTOM

# Utiliser dans le workflow :
token: ${{ secrets.GITHUB_TOKEN_CUSTOM }}
```

## 📞 Support

### **En cas de problème :**
1. **Vérifier** les permissions repository
2. **Exécuter** le script de test
3. **Vérifier** les logs GitHub Actions
4. **Consulter** la documentation GitHub
5. **Contacter** le support si nécessaire

### **Ressources Utiles :**
- [GitHub Actions Permissions](https://docs.github.com/en/actions/security-guides/automatic-token-authentication)
- [GitHub Actions Security](https://docs.github.com/en/actions/security-guides/security-hardening-for-github-actions)
- [GitHub Actions Troubleshooting](https://docs.github.com/en/actions/troubleshooting)

---

## 🎯 Résumé

### **✅ Configuration Correcte :**
- **Permissions repository** configurées
- **Token par défaut** utilisé
- **Workflow** corrigé
- **Scripts de test** disponibles

### **✅ Avantages :**
- **Sécurisé** - Permissions limitées
- **Automatique** - Pas de configuration manuelle
- **Gratuit** - Pas de quota limité
- **Maintenu** - Mise à jour automatique

**🚀 Le workflow de release devrait maintenant fonctionner correctement !** 