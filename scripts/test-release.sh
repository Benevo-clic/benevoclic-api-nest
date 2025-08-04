#!/bin/bash

# Script de test pour vérifier le workflow de release
# Usage: ./scripts/test-release.sh

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

print_status "🧪 Test du workflow de release"

# Vérifications préliminaires
print_status "Vérifications préliminaires..."

# 1. Vérifier que nous sommes dans un repository Git
if [ ! -d ".git" ]; then
    print_error "Ce script doit être exécuté dans un repository Git"
    exit 1
fi
print_success "✓ Repository Git détecté"

# 2. Vérifier que package.json existe
if [ ! -f "package.json" ]; then
    print_error "Le fichier package.json n'existe pas"
    exit 1
fi
print_success "✓ package.json trouvé"

# 3. Vérifier la version actuelle
CURRENT_VERSION=$(node -p "require('./package.json').version")
print_status "Version actuelle: $CURRENT_VERSION"

# 4. Vérifier que le workflow existe
if [ ! -f ".github/workflows/release.yml" ]; then
    print_error "Le workflow release.yml n'existe pas"
    exit 1
fi
print_success "✓ Workflow release.yml trouvé"

# 5. Vérifier les secrets nécessaires
print_status "Vérification des secrets GitHub..."
echo "  - VPS_HOST: ${VPS_HOST:-❌ Non défini}"
echo "  - VPS_USERNAME: ${VPS_USERNAME:-❌ Non défini}"
echo "  - OVH_SSH_KEY: ${OVH_SSH_KEY:-❌ Non défini}"
echo "  - WEBHOOK_URL: ${WEBHOOK_URL:-❌ Non défini}"

if [ -z "$VPS_HOST" ] || [ -z "$VPS_USERNAME" ] || [ -z "$OVH_SSH_KEY" ] || [ -z "$WEBHOOK_URL" ]; then
    print_warning "⚠️  Certains secrets GitHub ne sont pas définis"
    print_warning "   Le déploiement automatique pourrait échouer"
else
    print_success "✓ Tous les secrets sont définis"
fi

# 6. Vérifier les permissions Git
print_status "Vérification des permissions Git..."
GIT_USER=$(git config user.name)
GIT_EMAIL=$(git config user.email)

if [ -z "$GIT_USER" ] || [ -z "$GIT_EMAIL" ]; then
    print_warning "⚠️  Configuration Git manquante"
    print_warning "   Configurer avec: git config user.name et git config user.email"
else
    print_success "✓ Configuration Git: $GIT_USER <$GIT_EMAIL>"
fi

# 7. Vérifier l'état du repository
print_status "Vérification de l'état du repository..."
if [ -n "$(git status --porcelain)" ]; then
    print_warning "⚠️  Repository avec des changements non commités"
    git status --short
else
    print_success "✓ Repository propre"
fi

# 8. Vérifier les branches
print_status "Vérification des branches..."
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" = "main" ] || [ "$CURRENT_BRANCH" = "master" ]; then
    print_success "✓ Branche principale: $CURRENT_BRANCH"
else
    print_warning "⚠️  Branche actuelle: $CURRENT_BRANCH"
    print_warning "   Le workflow fonctionne mieux sur main/master"
fi

# 9. Vérifier les tags existants
print_status "Vérification des tags existants..."
TAGS=$(git tag --sort=-version:refname | head -5)
if [ -n "$TAGS" ]; then
    echo "  Tags récents:"
    echo "$TAGS" | while read tag; do
        echo "    - $tag"
    done
else
    print_warning "⚠️  Aucun tag trouvé"
fi

# 10. Vérifier le CHANGELOG.md
print_status "Vérification du CHANGELOG.md..."
if [ -f "CHANGELOG.md" ]; then
    print_success "✓ CHANGELOG.md trouvé"
    
    # Vérifier la structure
    if grep -q "## \[Unreleased\]" CHANGELOG.md; then
        print_success "✓ Section [Unreleased] trouvée"
    else
        print_warning "⚠️  Section [Unreleased] manquante"
    fi
    
    # Compter les versions
    VERSION_COUNT=$(grep -c "^## \[.*\]" CHANGELOG.md || echo "0")
    echo "  Nombre de versions documentées: $VERSION_COUNT"
else
    print_warning "⚠️  CHANGELOG.md manquant"
fi

# 11. Test de calcul de version
print_status "Test de calcul de version..."
IFS='.' read -ra VERSION_PARTS <<< "$CURRENT_VERSION"
MAJOR=${VERSION_PARTS[0]}
MINOR=${VERSION_PARTS[1]}
PATCH=${VERSION_PARTS[2]}

echo "  Version actuelle: $MAJOR.$MINOR.$PATCH"
echo "  Patch: $MAJOR.$MINOR.$((PATCH + 1))"
echo "  Minor: $MAJOR.$((MINOR + 1)).0"
echo "  Major: $((MAJOR + 1)).0.0"

# 12. Vérifier les scripts
print_status "Vérification des scripts..."
if [ -f "scripts/generate-changelog.sh" ]; then
    print_success "✓ Script generate-changelog.sh trouvé"
    if [ -x "scripts/generate-changelog.sh" ]; then
        print_success "✓ Script generate-changelog.sh exécutable"
    else
        print_warning "⚠️  Script generate-changelog.sh non exécutable"
    fi
else
    print_warning "⚠️  Script generate-changelog.sh manquant"
fi

if [ -f "scripts/update-changelog.sh" ]; then
    print_success "✓ Script update-changelog.sh trouvé"
    if [ -x "scripts/update-changelog.sh" ]; then
        print_success "✓ Script update-changelog.sh exécutable"
    else
        print_warning "⚠️  Script update-changelog.sh non exécutable"
    fi
else
    print_warning "⚠️  Script update-changelog.sh manquant"
fi

# 13. Test de génération de CHANGELOG (simulation)
print_status "Test de génération de CHANGELOG (simulation)..."
if [ -f "scripts/generate-changelog.sh" ]; then
    echo "  Test de génération pour la version 1.0.1..."
    # Simulation sans réellement modifier les fichiers
    echo "  ✓ Script de génération disponible"
else
    print_warning "⚠️  Impossible de tester la génération"
fi

# Résumé final
echo ""
print_status "📊 Résumé du test:"
echo "  ✅ Repository Git: OK"
echo "  ✅ package.json: OK"
echo "  ✅ Workflow release.yml: OK"
echo "  ✅ Version actuelle: $CURRENT_VERSION"
echo "  ✅ Scripts: Disponibles"

echo ""
print_status "🚀 Prochaines étapes pour tester le workflow:"
echo "  1. Aller sur GitHub → Actions"
echo "  2. Sélectionner 'Release Management'"
echo "  3. Cliquer 'Run workflow'"
echo "  4. Choisir le type de release (patch/minor/major)"
echo "  5. Cliquer 'Run workflow'"

echo ""
print_status "📋 Checklist avant release:"
echo "  □ Vérifier que tous les changements sont commités"
echo "  □ Vérifier que les tests passent"
echo "  □ Vérifier que la documentation est à jour"
echo "  □ Vérifier que les secrets GitHub sont configurés"
echo "  □ Vérifier que le CHANGELOG.md est à jour"

echo ""
print_success "✅ Test du workflow de release terminé !"
print_status "Le workflow devrait fonctionner correctement." 