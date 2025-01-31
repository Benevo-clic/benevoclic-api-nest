import { Controller, Get } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Controller()
export class AppController {
  constructor(@InjectConnection() private connection: Connection) {}

  @Get()
  async getHello(): Promise<string> {
    try {
      const isConnected = this.connection.readyState === 1;
      return isConnected ? 'Connexion à MongoDB réussie !' : 'Connexion à MongoDB échouée';
    } catch (error) {
      return `Erreur de connexion: ${error.message}`;
    }
  }
}
