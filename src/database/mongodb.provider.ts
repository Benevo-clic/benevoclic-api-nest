import { Provider } from '@nestjs/common';
import { MongoClient } from 'mongodb';
import { MongoConfig } from '../config/mongo.config';

export const MONGODB_CONNECTION = 'MONGODB_CONNECTION';

export const mongodbProvider: Provider = {
  provide: MONGODB_CONNECTION,
  useFactory: async (config: MongoConfig): Promise<MongoClient> => {
    const client = await MongoClient.connect(config.uri);
    return client;
  },
  inject: [MongoConfig],
};
