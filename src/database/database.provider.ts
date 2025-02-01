import { Injectable } from '@nestjs/common';
import { MongoClient, Db } from 'mongodb';
import { MongoConfig } from '../config/mongo.config';

@Injectable()
export class DatabaseProvider {
  private client: MongoClient;
  private db: Db;

  constructor(private readonly config: MongoConfig) {}

  async onModuleInit() {
    this.client = await MongoClient.connect(this.config.uri);
    this.db = this.client.db(this.config.dbName);
  }

  async onModuleDestroy() {
    await this.client?.close();
  }

  getDb(): Db {
    return this.db;
  }
}
