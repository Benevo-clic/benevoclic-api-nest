# 🔧 Guide des Scripts de Versioning - Benevoclic

## 📋 Vue d'ensemble

Ce guide explique l'utilisation des scripts pour automatiser la génération du CHANGELOG et la gestion des versions.

## 🎯 Scripts Disponibles

### **1. `scripts/generate-changelog.sh` - Génération Automatique du CHANGELOG**

#### **À quoi sert ce script ?**
Ce script analyse automatiquement vos commits conventionnels et génère le CHANGELOG.md correspondant.

#### **Fonctionnalités :**
- ✅ **Analyse des commits** depuis la dernière release
- ✅ **Catégorisation automatique** selon les types de commits
- ✅ **Génération du CHANGELOG** au format standard
- ✅ **Statistiques** des changements
- ✅ **Validation** des commits conventionnels

#### **Types de commits reconnus :**
```bash
feat(api): nouvelle fonctionnalité          → 🚀 Ajouté
fix(alertmanager): correction de bug       → 🐛 Corrigé
docs(readme): mise à jour documentation    → 📚 Documentation
refactor(workflows): optimisation          → ♻️ Refactorisation
perf(api): amélioration performance        → ⚡ Performance
test(api): ajout de tests                 → 🧪 Tests
chore(deps): mise à jour dépendances       → 🔧 Maintenance
ci(release): automatisation release        → 🔄 CI/CD
security(webhook): correction sécurité     → 🔒 Sécurité
config(prometheus): nouvelle config        → ⚙️ Configuration
```

#### **Utilisation :**
```bash
# Génération automatique pour la version 1.1.0
./scripts/generate-changelog.sh 1.1.0

# Avec une date spécifique
./scripts/generate-changelog.sh 1.1.0 2024-01-15

# Génération pour la version actuelle
./scripts/generate-changelog.sh $(npm version --json | jq -r '.version')
```

#### **Exemple de sortie :**
```bash
[INFO] Génération automatique du CHANGELOG.md pour la version 1.1.0 (2024-01-15)
[INFO] Récupération des commits depuis la dernière release...
[INFO] Catégorisation des commits...
[INFO] Création de l'entrée du CHANGELOG...
[SUCCESS] Entrée ajoutée au CHANGELOG.md
[INFO] Statistiques de la génération:
  - Version: 1.1.0
  - Date: 2024-01-15
  - Commits analysés: 12
[INFO] Résumé des changements:
  🚀 Ajouté: 5 éléments
  🔧 Modifié: 3 éléments
  🐛 Corrigé: 2 éléments
  🔒 Sécurité: 1 élément
[SUCCESS] Génération automatique du CHANGELOG terminée !
```

### **2. `scripts/update-changelog.sh` - Mise à Jour Manuelle du CHANGELOG**

#### **À quoi sert ce script ?**
Ce script permet d'ajouter manuellement une entrée dans le CHANGELOG.md avec une structure de base.

#### **Fonctionnalités :**
- ✅ **Ajout d'entrée** dans le CHANGELOG.md
- ✅ **Mise à jour** de la version dans package.json
- ✅ **Création de commit** automatique
- ✅ **Structure standardisée** de l'entrée

#### **Utilisation :**
```bash
# Ajouter une entrée pour la version 1.1.0
./scripts/update-changelog.sh 1.1.0

# Avec une date spécifique
./scripts/update-changelog.sh 1.1.0 2024-01-15
```

#### **Exemple de sortie :**
```bash
[INFO] Mise à jour du CHANGELOG.md pour la version 1.1.0 (2024-01-15)
[SUCCESS] Nouvelle entrée ajoutée au CHANGELOG.md
[INFO] Mise à jour de la version dans package.json
[SUCCESS] Version mise à jour dans package.json
[INFO] Création du commit pour les changements
[SUCCESS] Commit créé
[SUCCESS] Mise à jour du CHANGELOG.md terminée pour la version 1.1.0
[INFO] Statistiques de la version 1.1.0:
  - Date: 2024-01-15
  - Version: 1.1.0
  - Fichiers modifiés: CHANGELOG.md, package.json
```

## 🔄 Workflow Complet de Release

### **Étape 1 : Développement avec Commits Conventionnels**
```bash
# Développer avec des commits conventionnels
git commit -m "feat(api): ajouter endpoint monitoring"
git commit -m "fix(alertmanager): corriger les templates Discord"
git commit -m "docs(readme): mettre à jour la documentation"
```

### **Étape 2 : Génération Automatique du CHANGELOG**
```bash
# Générer automatiquement le CHANGELOG
./scripts/generate-changelog.sh 1.1.0

# Vérifier le résultat
cat CHANGELOG.md
```

### **Étape 3 : Ajustements Manuels (si nécessaire)**
```bash
# Éditer le CHANGELOG.md pour ajuster les descriptions
nano CHANGELOG.md

# Ajouter des détails manuels si nécessaire
```

### **Étape 4 : Création de la Release**
```bash
# Créer un commit pour les changements
git add CHANGELOG.md
git commit -m "docs(changelog): générer automatiquement pour v1.1.0"

# Créer un tag
git tag -a v1.1.0 -m "Release v1.1.0"

# Pousser les changements
git push origin main --tags
```

### **Étape 5 : Release GitHub Actions (Optionnel)**
```bash
# Via GitHub Actions
GitHub → Actions → Release Management → Run workflow
# Choisir le type: patch/minor/major
```

## 📊 Comparaison des Scripts

| Fonctionnalité | `generate-changelog.sh` | `update-changelog.sh` |
|----------------|-------------------------|----------------------|
| **Analyse des commits** | ✅ Automatique | ❌ Manuel |
| **Catégorisation** | ✅ Intelligente | ❌ Basique |
| **Statistiques** | ✅ Détaillées | ❌ Basiques |
| **Validation** | ✅ Commits conventionnels | ❌ Pas de validation |
| **Flexibilité** | ✅ Haute | ✅ Moyenne |
| **Automatisation** | ✅ Complète | ✅ Partielle |

## 🎯 Quand Utiliser Quel Script ?

### **Utiliser `generate-changelog.sh` quand :**
- ✅ Vous avez des **commits conventionnels** bien formatés
- ✅ Vous voulez une **génération automatique** complète
- ✅ Vous avez **beaucoup de commits** à analyser
- ✅ Vous voulez des **statistiques détaillées**

### **Utiliser `update-changelog.sh` quand :**
- ✅ Vous voulez une **entrée manuelle** simple
- ✅ Vous n'avez pas de **commits conventionnels**
- ✅ Vous voulez **ajouter des détails** manuellement
- ✅ Vous voulez une **structure de base** rapide

## 🔧 Configuration Avancée

### **Personnalisation des Types de Commits**
```bash
# Modifier le script pour ajouter de nouveaux types
nano scripts/generate-changelog.sh

# Ajouter dans la fonction categorize_commits
case $type in
    "feat")
        added+="- $description"$'\n'
        ;;
    "fix")
        fixed+="- $description"$'\n'
        ;;
    # Ajouter vos nouveaux types ici
    "custom")
        custom+="- $description"$'\n'
        ;;
esac
```

### **Personnalisation des Emojis**
```bash
# Modifier les emojis dans le script
nano scripts/generate-changelog.sh

# Changer les emojis selon vos préférences
echo "### 🚀 Ajouté"     # Pour les nouvelles fonctionnalités
echo "### 🐛 Corrigé"     # Pour les corrections
echo "### 🔧 Modifié"     # Pour les modifications
```

## 🚨 Dépannage

### **Problèmes Courants**

#### **1. Aucun commit trouvé**
```bash
# Erreur : "Aucun commit trouvé depuis la dernière release"
# Solution : Vérifier les tags Git
git tag --sort=-version:refname

# Si pas de tags, le script utilise HEAD~50
# Créer un premier tag si nécessaire
git tag -a v1.0.0 -m "Initial release"
```

#### **2. Commits non reconnus**
```bash
# Erreur : Commits non conventionnels
# Solution : Utiliser le format conventionnel
git commit -m "feat(api): ajouter fonctionnalité"
git commit -m "fix(bug): corriger problème"
```

#### **3. Permission refusée**
```bash
# Erreur : Permission denied
# Solution : Rendre le script exécutable
chmod +x scripts/generate-changelog.sh
chmod +x scripts/update-changelog.sh
```

#### **4. Fichier CHANGELOG.md non trouvé**
```bash
# Erreur : Le fichier CHANGELOG.md n'existe pas
# Solution : Le script le crée automatiquement
./scripts/generate-changelog.sh 1.0.0
```

## 📈 Métriques et Statistiques

### **Statistiques Générées**
```bash
# Exemple de sortie
[INFO] Statistiques de la génération:
  - Version: 1.1.0
  - Date: 2024-01-15
  - Commits analysés: 12

[INFO] Résumé des changements:
  🚀 Ajouté: 5 éléments
  🔧 Modifié: 3 éléments
  🐛 Corrigé: 2 éléments
  🔒 Sécurité: 1 élément
```

### **Types de Métriques**
- **Nombre de commits** analysés
- **Répartition par type** de modification
- **Temps de génération**
- **Qualité des commits** (conventionnels vs non)

## 🔄 Intégration avec GitHub Actions

### **Workflow Automatisé**
```yaml
# .github/workflows/release.yml
- name: Generate CHANGELOG
  run: |
    ./scripts/generate-changelog.sh ${{ steps.bump.outputs.new_version }}
```

### **Déclenchement Automatique**
```bash
# Le workflow GitHub Actions peut utiliser les scripts
# pour générer automatiquement le CHANGELOG lors des releases
```

## 📚 Ressources

### **Documentation**
- **[CHANGELOG.md](CHANGELOG.md)** - Journal des versions
- **[VERSIONING_GUIDE.md](VERSIONING_GUIDE.md)** - Guide complet
- **[QUICK_START_VERSIONING.md](QUICK_START_VERSIONING.md)** - Démarrage rapide

### **Outils Complémentaires**
- **Commitlint** - Validation des commits
- **Husky** - Git hooks
- **GitHub Actions** - Automatisation
- **Semantic Release** - Génération automatique

---

## 🎯 Avantages des Scripts

### **✅ Automatisation Complète**
- **Génération automatique** du CHANGELOG
- **Analyse intelligente** des commits
- **Catégorisation automatique** des changements

### **✅ Standardisation**
- **Format uniforme** du CHANGELOG
- **Validation** des commits conventionnels
- **Structure cohérente** des releases

### **✅ Gain de Temps**
- **Réduction** du travail manuel
- **Génération rapide** des release notes
- **Maintenance simplifiée** du CHANGELOG

### **✅ Qualité**
- **Validation** automatique des formats
- **Statistiques détaillées** des changements
- **Traçabilité complète** des évolutions

**🚀 Vos scripts sont prêts pour automatiser la génération du CHANGELOG !** 