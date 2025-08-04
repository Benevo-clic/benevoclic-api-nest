#!/bin/bash

# Script pour générer automatiquement le CHANGELOG.md à partir des commits conventionnels
# Usage: ./scripts/generate-changelog.sh [version] [date]

set -e

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction d'affichage
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Vérifier les arguments
if [ $# -eq 0 ]; then
    print_error "Usage: $0 <version> [date]"
    print_error "Exemple: $0 1.1.0 2024-01-15"
    exit 1
fi

VERSION=$1
DATE=${2:-$(date +%Y-%m-%d)}

print_status "Génération automatique du CHANGELOG.md pour la version $VERSION ($DATE)"

# Fonction pour extraire les commits depuis la dernière release
get_commits_since_last_release() {
    local last_tag=$(git describe --tags --abbrev=0 2>/dev/null || echo "HEAD~50")
    git log "$last_tag"..HEAD --pretty=format:"%s" --reverse
}

# Fonction pour catégoriser les commits
categorize_commits() {
    local commits="$1"
    
    # Initialiser les variables
    local added=""
    local modified=""
    local fixed=""
    local security=""
    local docs=""
    local refactor=""
    local perf=""
    local test=""
    local chore=""
    local ci=""
    local build=""
    local config=""
    
    # Lire chaque commit et le catégoriser
    while IFS= read -r commit; do
        # Extraire le type et la description
        if [[ $commit =~ ^(feat|fix|docs|style|refactor|perf|test|chore|ci|build|security|config)\([^)]+\):\ (.+)$ ]]; then
            local type="${BASH_REMATCH[1]}"
            local description="${BASH_REMATCH[2]}"
            
            case $type in
                "feat")
                    added+="- $description"$'\n'
                    ;;
                "fix")
                    fixed+="- $description"$'\n'
                    ;;
                "docs")
                    docs+="- $description"$'\n'
                    ;;
                "refactor")
                    refactor+="- $description"$'\n'
                    ;;
                "perf")
                    perf+="- $description"$'\n'
                    ;;
                "test")
                    test+="- $description"$'\n'
                    ;;
                "chore")
                    chore+="- $description"$'\n'
                    ;;
                "ci")
                    ci+="- $description"$'\n'
                    ;;
                "build")
                    build+="- $description"$'\n'
                    ;;
                "security")
                    security+="- $description"$'\n'
                    ;;
                "config")
                    config+="- $description"$'\n'
                    ;;
                *)
                    modified+="- $description"$'\n'
                    ;;
            esac
        else
            # Commit non conventionnel
            modified+="- $commit"$'\n'
        fi
    done <<< "$commits"
    
    # Retourner les catégories
    echo "ADDED:$added"
    echo "MODIFIED:$modified"
    echo "FIXED:$fixed"
    echo "SECURITY:$security"
    echo "DOCS:$docs"
    echo "REFACTOR:$refactor"
    echo "PERF:$perf"
    echo "TEST:$test"
    echo "CHORE:$chore"
    echo "CI:$ci"
    echo "BUILD:$build"
    echo "CONFIG:$config"
}

# Fonction pour créer l'entrée du CHANGELOG
create_changelog_entry() {
    local version="$1"
    local date="$2"
    local categories="$3"
    
    # Parser les catégories
    local added=$(echo "$categories" | grep "^ADDED:" | cut -d: -f2- | sed '/^$/d')
    local modified=$(echo "$categories" | grep "^MODIFIED:" | cut -d: -f2- | sed '/^$/d')
    local fixed=$(echo "$categories" | grep "^FIXED:" | cut -d: -f2- | sed '/^$/d')
    local security=$(echo "$categories" | grep "^SECURITY:" | cut -d: -f2- | sed '/^$/d')
    local docs=$(echo "$categories" | grep "^DOCS:" | cut -d: -f2- | sed '/^$/d')
    local refactor=$(echo "$categories" | grep "^REFACTOR:" | cut -d: -f2- | sed '/^$/d')
    local perf=$(echo "$categories" | grep "^PERF:" | cut -d: -f2- | sed '/^$/d')
    local test=$(echo "$categories" | grep "^TEST:" | cut -d: -f2- | sed '/^$/d')
    local chore=$(echo "$categories" | grep "^CHORE:" | cut -d: -f2- | sed '/^$/d')
    local ci=$(echo "$categories" | grep "^CI:" | cut -d: -f2- | sed '/^$/d')
    local build=$(echo "$categories" | grep "^BUILD:" | cut -d: -f2- | sed '/^$/d')
    local config=$(echo "$categories" | grep "^CONFIG:" | cut -d: -f2- | sed '/^$/d')
    
    # Créer le contenu du CHANGELOG
    cat << EOF
## [$version] - $date

EOF
    
    # Ajouter les sections avec du contenu
    if [ -n "$added" ]; then
        echo "### 🚀 Ajouté"
        echo "$added"
        echo ""
    fi
    
    if [ -n "$modified" ]; then
        echo "### 🔧 Modifié"
        echo "$modified"
        echo ""
    fi
    
    if [ -n "$fixed" ]; then
        echo "### 🐛 Corrigé"
        echo "$fixed"
        echo ""
    fi
    
    if [ -n "$security" ]; then
        echo "### 🔒 Sécurité"
        echo "$security"
        echo ""
    fi
    
    if [ -n "$docs" ]; then
        echo "### 📚 Documentation"
        echo "$docs"
        echo ""
    fi
    
    if [ -n "$refactor" ]; then
        echo "### ♻️ Refactorisation"
        echo "$refactor"
        echo ""
    fi
    
    if [ -n "$perf" ]; then
        echo "### ⚡ Performance"
        echo "$perf"
        echo ""
    fi
    
    if [ -n "$test" ]; then
        echo "### 🧪 Tests"
        echo "$test"
        echo ""
    fi
    
    if [ -n "$chore" ]; then
        echo "### 🔧 Maintenance"
        echo "$chore"
        echo ""
    fi
    
    if [ -n "$ci" ]; then
        echo "### 🔄 CI/CD"
        echo "$ci"
        echo ""
    fi
    
    if [ -n "$build" ]; then
        echo "### 📦 Build"
        echo "$build"
        echo ""
    fi
    
    if [ -n "$config" ]; then
        echo "### ⚙️ Configuration"
        echo "$config"
        echo ""
    fi
    
    echo "---"
    echo ""
}

# Vérifier que nous sommes dans un repository Git
if [ ! -d ".git" ]; then
    print_error "Ce script doit être exécuté dans un repository Git"
    exit 1
fi

# Obtenir les commits depuis la dernière release
print_status "Récupération des commits depuis la dernière release..."
commits=$(get_commits_since_last_release)

if [ -z "$commits" ]; then
    print_warning "Aucun commit trouvé depuis la dernière release"
    commits="chore(release): version $VERSION"
fi

# Catégoriser les commits
print_status "Catégorisation des commits..."
categories=$(categorize_commits "$commits")

# Créer l'entrée du CHANGELOG
print_status "Création de l'entrée du CHANGELOG..."
changelog_entry=$(create_changelog_entry "$VERSION" "$DATE" "$categories")

# Créer un fichier temporaire
TEMP_FILE=$(mktemp)
echo "$changelog_entry" > "$TEMP_FILE"

# Insérer dans le CHANGELOG.md
if [ -f "CHANGELOG.md" ]; then
    if grep -q "## \[Unreleased\]" CHANGELOG.md; then
        # Insérer après la section [Unreleased]
        awk '/^## \[Unreleased\]/ {print; system("cat '"$TEMP_FILE"'"); next} {print}' CHANGELOG.md > CHANGELOG.md.tmp
        mv CHANGELOG.md.tmp CHANGELOG.md
        print_success "Entrée ajoutée au CHANGELOG.md"
    else
        # Ajouter à la fin du fichier
        echo "" >> CHANGELOG.md
        cat "$TEMP_FILE" >> CHANGELOG.md
        print_success "Entrée ajoutée à la fin du CHANGELOG.md"
    fi
else
    # Créer un nouveau fichier CHANGELOG.md
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
    cat "$TEMP_FILE" >> CHANGELOG.md
    print_success "Nouveau fichier CHANGELOG.md créé"
fi

# Nettoyer le fichier temporaire
rm "$TEMP_FILE"

# Statistiques
print_status "Statistiques de la génération:"
echo "  - Version: $VERSION"
echo "  - Date: $DATE"
echo "  - Commits analysés: $(echo "$commits" | wc -l)"

# Afficher un résumé des changements
print_status "Résumé des changements:"
if [ -n "$(echo "$categories" | grep "^ADDED:" | cut -d: -f2- | sed '/^$/d')" ]; then
    echo "  🚀 Ajouté: $(echo "$categories" | grep "^ADDED:" | cut -d: -f2- | wc -l) éléments"
fi
if [ -n "$(echo "$categories" | grep "^MODIFIED:" | cut -d: -f2- | sed '/^$/d')" ]; then
    echo "  🔧 Modifié: $(echo "$categories" | grep "^MODIFIED:" | cut -d: -f2- | wc -l) éléments"
fi
if [ -n "$(echo "$categories" | grep "^FIXED:" | cut -d: -f2- | sed '/^$/d')" ]; then
    echo "  🐛 Corrigé: $(echo "$categories" | grep "^FIXED:" | cut -d: -f2- | wc -l) éléments"
fi
if [ -n "$(echo "$categories" | grep "^SECURITY:" | cut -d: -f2- | sed '/^$/d')" ]; then
    echo "  🔒 Sécurité: $(echo "$categories" | grep "^SECURITY:" | cut -d: -f2- | wc -l) éléments"
fi

print_success "Génération automatique du CHANGELOG terminée !"

# Suggestions
echo ""
print_status "Prochaines étapes suggérées:"
echo "  1. Vérifier le contenu du CHANGELOG.md"
echo "  2. Ajuster les descriptions si nécessaire"
echo "  3. Créer un commit: git add CHANGELOG.md && git commit -m 'docs(changelog): générer automatiquement pour v$VERSION'"
echo "  4. Créer un tag: git tag -a v$VERSION -m 'Release v$VERSION'"
echo "  5. Pousser: git push origin main --tags" 