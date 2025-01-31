import { MongoClient } from 'mongodb';
import { testMongoConfig } from '../src/config/test.config';
import '@jest/globals';

global.beforeAll(async () => {
  const client = new MongoClient(testMongoConfig.uri);
  await client.connect();
  await client.db(testMongoConfig.dbName).dropDatabase();
  await client.close();
});
