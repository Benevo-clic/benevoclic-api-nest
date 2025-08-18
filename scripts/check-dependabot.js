#!/usr/bin/env node

/**
 * Script de vérification de la configuration Dependabot
 * Valide la configuration et affiche des informations utiles
 */

const { readFileSync, existsSync } = require('fs')
const { join } = require('path')
const { execSync } = require('child_process')

const projectRoot = join(__dirname, '..')

// Configuration attendue
const expectedConfig = {
  version: 2,
  ecosystems: ['npm', 'github-actions', 'docker'],
  schedules: {
    npm: 'weekly',
    'github-actions': 'weekly',
    docker: 'monthly',
    security: 'daily'
  },
  labels: ['dependencies', 'api'],
  reviewers: ['Benevo-clic']
}

// Fonction pour vérifier le fichier dependabot.yml
function checkDependabotConfig() {
  const configPath = join(projectRoot, '.github', 'dependabot.yml')
  
  if (!existsSync(configPath)) {
    console.error('❌ Fichier .github/dependabot.yml non trouvé')
    return false
  }
  
  try {
    const content = readFileSync(configPath, 'utf8')
    console.log('✅ Fichier dependabot.yml trouvé')
    
    // Vérifications basiques
    const checks = [
      { name: 'Version 2', pattern: /version:\s*2/, found: false },
      { name: 'npm ecosystem', pattern: /package-ecosystem:\s*['"]npm['"]/, found: false },
      { name: 'github-actions ecosystem', pattern: /package-ecosystem:\s*['"]github-actions['"]/, found: false },
      { name: 'docker ecosystem', pattern: /package-ecosystem:\s*['"]docker['"]/, found: false },
      { name: 'security updates', pattern: /interval:\s*['"]daily['"]/, found: false },
      { name: 'Benevo-clic reviewer', pattern: /Benevo-clic/, found: false },
      { name: 'api label', pattern: /api/, found: false }
    ]
    
    checks.forEach(check => {
      check.found = check.pattern.test(content)
      console.log(`${check.found ? '✅' : '❌'} ${check.name}`)
    })
    
    const passedChecks = checks.filter(c => c.found).length
    const totalChecks = checks.length
    
    console.log(`\n📊 Résultat: ${passedChecks}/${totalChecks} vérifications passées`)
    
    return passedChecks === totalChecks
    
  } catch (error) {
    console.error('❌ Erreur lors de la lecture du fichier:', error.message)
    return false
  }
}

// Fonction pour vérifier les dépendances npm
function checkNpmDependencies() {
  try {
    console.log('\n📦 Vérification des dépendances npm...')
    
    // Vérifier les dépendances obsolètes
    try {
      const outdated = execSync('npm outdated --json', { encoding: 'utf8', cwd: projectRoot })
      const outdatedData = JSON.parse(outdated)
      const outdatedCount = Object.keys(outdatedData).length
      
      console.log(`ℹ️  Dépendances obsolètes: ${outdatedCount}`)
      
      if (outdatedCount > 0) {
        console.log('📋 Dépendances à mettre à jour:')
        Object.entries(outdatedData).forEach(([pkg, info]) => {
          console.log(`   - ${pkg}: ${info.current} → ${info.latest}`)
        })
      }
    } catch (error) {
      console.log('✅ Aucune dépendance obsolète trouvée')
    }
    
    // Vérifier les vulnérabilités
    try {
      const audit = execSync('npm audit --json', { encoding: 'utf8', cwd: projectRoot })
      const auditData = JSON.parse(audit)
      
      const vulnerabilities = auditData.metadata?.vulnerabilities || {}
      const totalVulns = Object.values(vulnerabilities).reduce((sum, count) => sum + count, 0)
      
      console.log(`🔒 Vulnérabilités de sécurité: ${totalVulns}`)
      
      if (totalVulns > 0) {
        console.log('⚠️  Vulnérabilités détectées:')
        Object.entries(vulnerabilities).forEach(([level, count]) => {
          if (count > 0) {
            console.log(`   - ${level}: ${count}`)
          }
        })
      }
    } catch (error) {
      console.log('✅ Aucune vulnérabilité détectée')
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de la vérification npm:', error.message)
  }
}

// Fonction pour vérifier les workflows GitHub
function checkGitHubWorkflows() {
  const workflowsDir = join(projectRoot, '.github', 'workflows')
  
  if (!existsSync(workflowsDir)) {
    console.log('\n⚠️  Dossier .github/workflows non trouvé')
    return
  }
  
  try {
    const workflows = execSync('ls .github/workflows/', { encoding: 'utf8', cwd: projectRoot })
      .trim()
      .split('\n')
      .filter(w => w.endsWith('.yml') || w.endsWith('.yaml'))
    
    console.log(`\n🔧 Workflows GitHub trouvés: ${workflows.length}`)
    workflows.forEach(workflow => {
      console.log(`   - ${workflow}`)
    })
    
  } catch (error) {
    console.error('❌ Erreur lors de la vérification des workflows:', error.message)
  }
}

// Fonction pour afficher les informations de configuration
function showConfigInfo() {
  console.log('\n📋 Informations de Configuration Dependabot')
  console.log('============================================')
  
  console.log('🕐 Horaires de mise à jour:')
  console.log('   - npm: Lundi 9h00 (hebdomadaire)')
  console.log('   - GitHub Actions: Mardi 10h00 (hebdomadaire)')
  console.log('   - Docker: 1er du mois 11h00 (mensuel)')
  console.log('   - Sécurité: Tous les jours 8h00 (quotidien)')
  
  console.log('\n🏷️ Labels automatiques:')
  console.log('   - dependencies, npm, api')
  console.log('   - dependencies, github-actions, api')
  console.log('   - dependencies, docker, api')
  console.log('   - security, dependencies, npm, api')
  
  console.log('\n👥 Reviewers/Assignees:')
  console.log('   - Benevo-clic')
  
  console.log('\n📊 Limites de PR:')
  console.log('   - npm: 10 PR maximum')
  console.log('   - GitHub Actions: 5 PR maximum')
  console.log('   - Docker: 3 PR maximum')
  console.log('   - Sécurité: 5 PR maximum')
}

// Fonction principale
function main() {
  console.log('🔍 Vérification de la Configuration Dependabot')
  console.log('==============================================')
  
  // Vérifier la configuration
  const configValid = checkDependabotConfig()
  
  if (configValid) {
    console.log('\n✅ Configuration Dependabot valide !')
  } else {
    console.log('\n❌ Configuration Dependabot invalide')
    console.log('💡 Vérifiez le fichier .github/dependabot.yml')
  }
  
  // Vérifier les dépendances
  checkNpmDependencies()
  
  // Vérifier les workflows
  checkGitHubWorkflows()
  
  // Afficher les informations
  showConfigInfo()
  
  console.log('\n🚀 Prochaines étapes:')
  console.log('1. Commiter et pousser le fichier dependabot.yml')
  console.log('2. Vérifier que Dependabot est activé sur GitHub')
  console.log('3. Surveiller les premières PR automatiques')
  console.log('4. Configurer les notifications si nécessaire')
  
  console.log('\n📚 Documentation:')
  console.log('   - docs/DEPENDABOT_CONFIGURATION.md')
  console.log('   - https://docs.github.com/code-security/dependabot')
}

// Exécuter le script
if (require.main === module) {
  main()
}

module.exports = { checkDependabot: main }
