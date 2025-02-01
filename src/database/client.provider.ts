import { MongoClient, ReadPreference } from 'mongodb';
import { MongoConfig } from '../config/mongo.config';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class ClientProvider {
  private readonly logger = new Logger(ClientProvider.name);

  constructor(private mongoConfig: MongoConfig) {}

  async createClient(): Promise<MongoClient> {
    return await MongoClient.connect(this.mongoConfig.uri, {
      ignoreUndefined: true,
      readPreference: ReadPreference.SECONDARY_PREFERRED,
      maxIdleTimeMS: this.mongoConfig.maxIdleTimeMS(),
      maxPoolSize: this.mongoConfig.maxPoolSize(),
    });
  }

  async closeClient(client: MongoClient): Promise<void> {
    await client.close();
  }
}
