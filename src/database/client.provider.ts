import { MongoClient, ReadPreference } from 'mongodb';
import { MongoConfig } from '@config/mongo.config';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ClientProvider {
  constructor(private mongoConfig: MongoConfig) {}

  async createClient(): Promise<MongoClient> {
    const client = await MongoClient.connect(this.mongoConfig.uri, {
      ignoreUndefined: true,
      readPreference: ReadPreference.SECONDARY_PREFERRED,
      maxIdleTimeMS: this.mongoConfig.maxIdleTimeMS(),
      maxPoolSize: this.mongoConfig.maxPoolSize(),
    });

    const db = client.db(this.mongoConfig.dbName);
    await db.command({ ping: 1 });

    return client;
  }

  async closeClient(client: MongoClient): Promise<void> {
    await client.close();
  }
}
