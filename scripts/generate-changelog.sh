#!/bin/bash

# Script pour générer un changelog basé sur les commits conventionnels
# Usage: ./scripts/generate-changelog.sh [version] [date]

VERSION=${1:-$(node -p "require('./package.json').version")}
DATE=${2:-$(date +%Y-%m-%d)}

echo "Génération du changelog pour la version $VERSION ($DATE)"

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

echo "Entrée changelog générée :"
echo "=========================="
cat temp_changelog.md
echo "=========================="

echo ""
echo "Pour intégrer cette entrée dans CHANGELOG.md :"
echo "1. Copiez le contenu ci-dessus"
echo "2. Ajoutez-le après la section [Unreleased] dans CHANGELOG.md"
echo "3. Ou exécutez : ./scripts/update-changelog.sh $VERSION"

# Nettoyer
rm temp_changelog.md 