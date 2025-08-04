#!/bin/bash

# Script pour mettre à jour le CHANGELOG.md automatiquement
# Usage: ./scripts/update-changelog.sh [version] [date]

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

print_status "Mise à jour du CHANGELOG.md pour la version $VERSION ($DATE)"

# Vérifier que le fichier CHANGELOG.md existe
if [ ! -f "CHANGELOG.md" ]; then
    print_error "Le fichier CHANGELOG.md n'existe pas"
    exit 1
fi

# Créer un fichier temporaire pour la nouvelle entrée
TEMP_FILE=$(mktemp)

cat > "$TEMP_FILE" << EOF
## [$VERSION] - $DATE

### 🚀 Ajouté
- Release $VERSION

### 🔧 Modifié
- Mise à jour de la version

---

EOF

# Insérer la nouvelle entrée après la section [Unreleased]
if grep -q "## \[Unreleased\]" CHANGELOG.md; then
    # Trouver la ligne après [Unreleased] et insérer le contenu
    awk '/^## \[Unreleased\]/ {print; system("cat '"$TEMP_FILE"'"); next} {print}' CHANGELOG.md > CHANGELOG.md.tmp
    mv CHANGELOG.md.tmp CHANGELOG.md
    print_success "Nouvelle entrée ajoutée au CHANGELOG.md"
else
    print_warning "Section [Unreleased] non trouvée, ajout à la fin du fichier"
    echo "" >> CHANGELOG.md
    cat "$TEMP_FILE" >> CHANGELOG.md
fi

# Nettoyer le fichier temporaire
rm "$TEMP_FILE"

# Mettre à jour la version dans package.json
if [ -f "package.json" ]; then
    print_status "Mise à jour de la version dans package.json"
    npm version "$VERSION" --no-git-tag-version
    print_success "Version mise à jour dans package.json"
fi

# Créer un commit pour les changements
if git status --porcelain | grep -q .; then
    print_status "Création du commit pour les changements"
    git add CHANGELOG.md package.json
    git commit -m "docs(changelog): ajouter entrée pour la version $VERSION"
    print_success "Commit créé"
else
    print_warning "Aucun changement détecté"
fi

print_success "Mise à jour du CHANGELOG.md terminée pour la version $VERSION"

# Afficher les statistiques
print_status "Statistiques de la version $VERSION:"
echo "  - Date: $DATE"
echo "  - Version: $VERSION"
echo "  - Fichiers modifiés: CHANGELOG.md, package.json"

# Suggestions pour la suite
echo ""
print_status "Prochaines étapes suggérées:"
echo "  1. Vérifier le contenu du CHANGELOG.md"
echo "  2. Ajouter les détails des changements"
echo "  3. Créer un tag Git: git tag -a v$VERSION -m 'Release v$VERSION'"
echo "  4. Pousser les changements: git push origin main --tags"
echo "  5. Créer une release GitHub" 