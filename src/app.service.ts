import { Injectable, Inject, OnApplicationShutdown } from '@nestjs/common';
import { MongoClient } from 'mongodb';

@Injectable()
export class AppService implements OnApplicationShutdown {
  constructor(
    @Inject('MONGODB_CONNECTION')
    private readonly mongoClient: MongoClient,
  ) {}

  async getHello(): Promise<string> {
    try {
      // Tester la connexion en exécutant une commande simple
      await this.mongoClient.db().command({ ping: 1 });
      return 'Connexion MongoDB OK!';
    } catch (error) {
      return `Erreur de connexion MongoDB: ${error.message}`;
    }
  }

  async onApplicationShutdown() {
    await this.mongoClient.close();
  }
}
