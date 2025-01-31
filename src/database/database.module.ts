import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongoClient } from 'mongodb';
import { seedAnnouncements } from './seeds/announcement.seed';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: 'MONGODB_CONNECTION',
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        try {
          const client = new MongoClient(configService.get<string>('MONGODB_URI'));
          await client.connect();

          // Initialiser les données
          await seedAnnouncements(client);

          return client;
        } catch (error) {
          throw new Error(`Failed to connect to MongoDB: ${error.message}`);
        }
      },
    },
  ],
  exports: ['MONGODB_CONNECTION'],
})
export class DatabaseModule {}
