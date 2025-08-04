#!/bin/bash

# Script pour mettre à jour automatiquement le CHANGELOG.md
# Usage: ./scripts/update-changelog.sh [version] [date]

VERSION=${1:-$(node -p "require('./package.json').version")}
DATE=${2:-$(date +%Y-%m-%d)}

echo "Mise à jour du CHANGELOG.md pour la version $VERSION ($DATE)"

# Obtenir la dernière version taggée ou HEAD^ si pas de tag
LAST_TAG=$(git describe --tags --abbrev=0 2>/dev/null || echo HEAD^)

echo "Analyse des commits depuis $LAST_TAG..."

# Récupérer tous les commits depuis la dernière version
ALL_COMMITS=$(git log $LAST_TAG..HEAD --pretty=format:"%s")

# Catégoriser les commits par type
FEATURES=$(echo "$ALL_COMMITS" | grep -E "^feat:" || echo "")
FIXES=$(echo "$ALL_COMMITS" | grep -E "^fix:" || echo "")
DOCS=$(echo "$ALL_COMMITS" | grep -E "^docs:" || echo "")
CHORES=$(echo "$ALL_COMMITS" | grep -E "^chore:" || echo "")
REFACTORS=$(echo "$ALL_COMMITS" | grep -E "^refactor:" || echo "")
TESTS=$(echo "$ALL_COMMITS" | grep -E "^test:" || echo "")
STYLES=$(echo "$ALL_COMMITS" | grep -E "^style:" || echo "")
PERFS=$(echo "$ALL_COMMITS" | grep -E "^perf:" || echo "")

# Fonction pour formater les commits
format_commits() {
    echo "$1" | while IFS= read -r commit; do
        if [ -n "$commit" ]; then
            # Extraire le message sans le préfixe
            message=$(echo "$commit" | sed 's/^[^:]*: //')
            echo "- $message"
        fi
    done
}

echo "Création de l'entrée changelog..."

# Créer l'entrée changelog
cat > temp_changelog.md << EOF
## [$VERSION] - $DATE

EOF

# Ajouter les fonctionnalités si elles existent
if [ -n "$FEATURES" ]; then
    cat >> temp_changelog.md << EOF
### 🚀 Ajouté
$(format_commits "$FEATURES")

EOF
fi

# Ajouter les corrections si elles existent
if [ -n "$FIXES" ]; then
    cat >> temp_changelog.md << EOF
### 🐛 Corrigé
$(format_commits "$FIXES")

EOF
fi

# Ajouter la documentation si elle existe
if [ -n "$DOCS" ]; then
    cat >> temp_changelog.md << EOF
### 📚 Documentation
$(format_commits "$DOCS")

EOF
fi

# Ajouter les refactorisations si elles existent
if [ -n "$REFACTORS" ]; then
    cat >> temp_changelog.md << EOF
### ♻️ Refactorisation
$(format_commits "$REFACTORS")

EOF
fi

# Ajouter les tests si ils existent
if [ -n "$TESTS" ]; then
    cat >> temp_changelog.md << EOF
### 🧪 Tests
$(format_commits "$TESTS")

EOF
fi

# Ajouter les styles si ils existent
if [ -n "$STYLES" ]; then
    cat >> temp_changelog.md << EOF
### 💄 Style
$(format_commits "$STYLES")

EOF
fi

# Ajouter les performances si elles existent
if [ -n "$PERFS" ]; then
    cat >> temp_changelog.md << EOF
### ⚡ Performance
$(format_commits "$PERFS")

EOF
fi

# Ajouter les tâches de maintenance si elles existent
if [ -n "$CHORES" ]; then
    cat >> temp_changelog.md << EOF
### 🔧 Maintenance
$(format_commits "$CHORES")

EOF
fi

# Ajouter la ligne de séparation
cat >> temp_changelog.md << EOF
---

EOF

echo "Intégration dans CHANGELOG.md..."

# Vérifier si CHANGELOG.md existe
if [ ! -f "CHANGELOG.md" ]; then
    echo "Création du fichier CHANGELOG.md..."
    cat > CHANGELOG.md << EOF
# 📋 Changelog - Benevoclic API

Toutes les modifications notables de ce projet seront documentées dans ce fichier.

Le format est basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/),
et ce projet adhère au [Semantic Versioning](https://semver.org/lang/fr/).

## [Unreleased]

### 🚀 Ajouté
- Fonctionnalités en cours de développement

---

EOF
fi

# Insérer l'entrée dans CHANGELOG.md
if grep -q "## \[Unreleased\]" CHANGELOG.md; then
    # Insérer après la section [Unreleased]
    awk '/^## \[Unreleased\]/ {print; system("cat temp_changelog.md"); next} {print}' CHANGELOG.md > CHANGELOG.md.tmp
    mv CHANGELOG.md.tmp CHANGELOG.md
    echo "✅ Entrée ajoutée après la section [Unreleased]"
else
    # Ajouter au début du fichier
    cat temp_changelog.md CHANGELOG.md > CHANGELOG.md.tmp
    mv CHANGELOG.md.tmp CHANGELOG.md
    echo "✅ Entrée ajoutée au début du fichier"
fi

# Nettoyer
rm temp_changelog.md

echo "✅ CHANGELOG.md mis à jour avec succès !"
echo ""
echo "Prochaines étapes :"
echo "1. Vérifier le contenu : cat CHANGELOG.md"
echo "2. Commiter les changements : git add CHANGELOG.md"
echo "3. Créer un commit : git commit -m 'docs: update CHANGELOG for version $VERSION'"
echo "4. Pousser : git push origin main" 