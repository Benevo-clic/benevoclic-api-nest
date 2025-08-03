module.exports = {
  apps: [
    {
      name: 'benevoclic-api',
      script: 'dist/main.js',
      instances: 1, // ✅ Une seule instance pour éviter les conflits de port
      exec_mode: 'fork', // ✅ Mode fork au lieu de cluster
      env: {
        NODE_ENV: 'development',
        PORT: 3000,
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
        MONGODB_URL: process.env.MONGODB_URL,
        MONGODB_DB_NAME: process.env.MONGODB_DB_NAME || 'benevoclic',
        FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL,
        FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY,
        FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
        FIREBASE_API_KEY: process.env.FIREBASE_API_KEY,
        AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
        AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
        AWS_BUCKET_NAME: process.env.AWS_BUCKET_NAME,
        AWS_REGION: process.env.AWS_REGION,
      },
      // Configuration des logs
      log_file: './logs/combined.log',
      out_file: './logs/out.log',
      error_file: './logs/error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',

      // Configuration du monitoring
      max_memory_restart: '1G',
      min_uptime: '10s',
      max_restarts: 10,

      // Configuration du watch (développement)
      watch: false,
      ignore_watch: ['node_modules', 'logs', 'dist'],

      // Configuration des variables d'environnement
      env_file: '.env',

      // Configuration du clustering
      instances: 1, // ✅ Une seule instance pour éviter les conflits de port

      // Configuration du restart
      autorestart: true,
      restart_delay: 4000,

      // Configuration des timeouts
      kill_timeout: 5000,
      listen_timeout: 3000,

      // Configuration des logs
      merge_logs: true,

      // Configuration du monitoring
      pmx: true,

      // Configuration des notifications
      notify: false,
    },
  ],

  // Configuration du déploiement
  deploy: {
    production: {
      user: process.env.VPS_USERNAME,
      host: process.env.VPS_HOST,
      ref: 'origin/main',
      repo: 'git@github.com:Benevo-clic/benevoclic-api-nest.git',
      path: '/home/debian/benevoclic-api',
      'pre-deploy-local': '',
      'post-deploy':
        'npm install && npm run build && pm2 reload ecosystem.config.js --env production',
      'pre-setup': '',
    },
  },
};
