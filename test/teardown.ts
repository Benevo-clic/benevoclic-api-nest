import { MongoClient } from 'mongodb';

let client: MongoClient;

// Fonction pour définir le client
export const setClient = (mongoClient: MongoClient) => {
  client = mongoClient;
};

// Fonction pour fermer la connexion MongoDB
export const closeMongoConnection = async () => {
  if (client) {
    try {
      // Fermeture forcée avec timeout
      await Promise.race([
        client.close(true),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Timeout closing MongoDB')), 5000),
        ),
      ]);
      console.log('MongoDB connection closed successfully');
    } catch (error) {
      console.warn('Error closing MongoDB connection:', error);
      // Force la fermeture même en cas d'erreur
      try {
        client.close();
      } catch (e) {
        console.warn('Force close failed:', e);
      }
    }
  }
};

// Fonction globale de teardown pour Jest
export default async function globalTeardown() {
  await closeMongoConnection();

  // Attendre un peu pour s'assurer que tout est fermé
  await new Promise(resolve => setTimeout(resolve, 1000));
}

// Fermeture forcée au niveau du processus
process.on('beforeExit', async () => {
  await closeMongoConnection();
});

process.on('SIGINT', async () => {
  await closeMongoConnection();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await closeMongoConnection();
  process.exit(0);
});

// Fermeture forcée lors de la sortie du processus
process.on('exit', () => {
  if (client) {
    try {
      client.close();
    } catch (e) {
      // Ignore les erreurs lors de la sortie
    }
  }
});
