# 🚀 Guide de Démarrage Rapide - Versioning Benevoclic

## 📋 Vue d'ensemble

Ce guide vous permet de démarrer rapidement avec le système de traçabilité des évolutions de Benevoclic.

## 🎯 Critères Respectés

✅ **Traçabilité des évolutions** - Journal complet des versions  
✅ **Versioning** - Gestion sémantique des versions  
✅ **Release notes** - Documentation détaillée des changements  
✅ **Historique complet** - Suivi de toutes les modifications  

## 🚀 Démarrage Rapide

### **1. Première Release**

```bash
# 1. Vérifier la version actuelle
npm version

# 2. Mettre à jour le CHANGELOG
./scripts/update-changelog.sh 1.0.0

# 3. Créer un tag Git
git tag -a v1.0.0 -m "Release v1.0.0"

# 4. Pousser les changements
git push origin main --tags

# 5. Créer une release GitHub
# Aller sur GitHub → Releases → Create a new release
```

### **2. Release Quotidienne**

```bash
# 1. Développer avec des commits conventionnels
git commit -m "feat(api): ajouter endpoint monitoring"
git commit -m "fix(alertmanager): corriger les templates Discord"

# 2. Créer une release via GitHub Actions
# GitHub → Actions → Release Management → Run workflow
# Choisir le type: patch/minor/major

# 3. Le système automatise tout le reste !
```

### **3. Commits Conventionnels**

```bash
# Format standard
<type>(<scope>): <description>

# Exemples
feat(api): ajouter endpoint de monitoring
fix(alertmanager): corriger les templates Discord
docs(readme): mettre à jour la documentation
refactor(workflows): optimiser les workflows GitHub Actions
```

## 📊 Types de Releases

### **Patch Release (1.0.0 → 1.0.1)**
- Corrections de bugs
- Améliorations mineures
- Mises à jour de sécurité

### **Minor Release (1.0.0 → 1.1.0)**
- Nouvelles fonctionnalités
- Améliorations compatibles
- Nouvelles configurations

### **Major Release (1.0.0 → 2.0.0)**
- Changements incompatibles
- Refactorisations majeures
- Nouvelles architectures

## 🔄 Workflow Automatisé

### **1. Déclenchement**
```bash
# Via GitHub Actions
GitHub → Actions → Release Management → Run workflow

# Ou via tag Git
git tag v1.1.0
git push origin v1.1.0
```

### **2. Automatisation**
- ✅ **Bump de version** dans package.json
- ✅ **Mise à jour** du CHANGELOG.md
- ✅ **Création** du tag Git
- ✅ **Génération** de la Release GitHub
- ✅ **Déploiement** automatique
- ✅ **Notification** Discord

### **3. Résultat**
- 📦 **Release GitHub** avec notes détaillées
- 🚀 **Déploiement** automatique en production
- 📊 **Monitoring** post-déploiement
- 🔔 **Notification** Discord de succès/échec

## 📋 Checklist de Release

### **Avant la Release**
- [ ] **Tests** automatisés passent
- [ ] **Documentation** mise à jour
- [ ] **CHANGELOG.md** à jour
- [ ] **Code review** effectuée

### **Pendant la Release**
- [ ] **Type de release** choisi (patch/minor/major)
- [ ] **Workflow GitHub Actions** déclenché
- [ ] **Vérification** des logs

### **Après la Release**
- [ ] **Déploiement** réussi
- [ ] **Notification Discord** reçue
- [ ] **Monitoring** vérifié
- [ ] **Communication** à l'équipe

## 🔧 Commandes Utiles

### **Vérification de l'État**
```bash
# Voir la version actuelle
npm version

# Voir l'historique des tags
git tag --sort=-version:refname

# Voir les commits depuis la dernière release
git log $(git describe --tags --abbrev=0)..HEAD --oneline
```

### **Gestion des Versions**
```bash
# Mettre à jour le CHANGELOG
./scripts/update-changelog.sh 1.1.0

# Créer un tag
git tag -a v1.1.0 -m "Release v1.1.0"

# Pousser les tags
git push origin --tags

# Supprimer un tag (si nécessaire)
git tag -d v1.1.0
git push origin :refs/tags/v1.1.0
```

### **Validation des Commits**
```bash
# Vérifier le format d'un commit
git commit -m "feat(api): ajouter endpoint monitoring"

# Si commit rejeté, utiliser le format conventionnel
git commit -m "feat(api): ajouter endpoint monitoring"
```

## 📊 Monitoring des Releases

### **Dashboard de Suivi**
```bash
# Statistiques des releases
| Version | Date | Fonctionnalités | Corrections | Breaking Changes |
|---------|------|-----------------|-------------|------------------|
| 1.0.0   | 2024-01-01 | 15 | 8 | 0 |
| 1.1.0   | 2024-01-15 | 12 | 5 | 0 |
| 1.1.1   | 2024-01-20 | 0 | 3 | 0 |
```

### **Métriques Clés**
- **Nombre de releases** par mois
- **Temps entre releases**
- **Types de modifications** les plus fréquents
- **Taux de bugs** par version

## 🚨 Dépannage

### **Problèmes Courants**

#### **1. Commit Rejeté**
```bash
# Erreur : commitlint
git commit -m "ajouter fonctionnalité"

# Solution : Format conventionnel
git commit -m "feat(api): ajouter fonctionnalité"
```

#### **2. Release Échouée**
```bash
# Vérifier les logs GitHub Actions
GitHub → Actions → Release Management → Voir les logs

# Vérifier les permissions
GitHub → Settings → Actions → General → Workflow permissions
```

#### **3. Version Incorrecte**
```bash
# Vérifier la version
npm version

# Corriger la version
npm version 1.1.0 --no-git-tag-version
```

## 📚 Documentation Complète

### **Guides Détaillés**
- **[CHANGELOG.md](CHANGELOG.md)** - Journal des versions
- **[VERSIONING_GUIDE.md](VERSIONING_GUIDE.md)** - Guide complet
- **[.github/workflows/release.yml](.github/workflows/release.yml)** - Workflow de release

### **Outils**
- **Commitlint** - Validation des commits
- **Husky** - Git hooks
- **GitHub Actions** - Automatisation
- **Scripts** - Outils personnalisés

## 🎯 Avantages

### **✅ Traçabilité Complète**
- **Historique détaillé** de toutes les modifications
- **Release notes** automatiques
- **Suivi des versions** centralisé

### **✅ Qualité du Code**
- **Commits standardisés** pour la lisibilité
- **Validation automatique** des messages
- **Tests obligatoires** avant release

### **✅ Maintenance Facilitée**
- **Identification rapide** des problèmes
- **Rollback simplifié** vers les versions précédentes
- **Documentation** toujours à jour

### **✅ Communication Équipe**
- **Notifications automatiques** des releases
- **Transparence** sur les évolutions
- **Collaboration** améliorée

---

## 🚀 Prochaines Étapes

1. **Lire** le [VERSIONING_GUIDE.md](VERSIONING_GUIDE.md) complet
2. **Tester** le workflow de release
3. **Configurer** les notifications Discord
4. **Former** l'équipe aux commits conventionnels
5. **Démarrer** le versioning de votre projet !

**🎉 Votre projet respecte maintenant les critères de traçabilité des évolutions !** 