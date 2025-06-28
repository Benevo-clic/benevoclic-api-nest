import { MongoClient } from 'mongodb';
import { testMongoConfig } from '../src/config/test.config';
import { closeMongoConnection, setClient } from './teardown';
import '@jest/globals';

let client: MongoClient;

global.beforeAll(async () => {
  client = new MongoClient(testMongoConfig.uri, {
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 10000,
    socketTimeoutMS: 10000,
  });
  await client.connect();
  await client.db(testMongoConfig.dbName).dropDatabase();
  setClient(client);
}, 30000);

global.afterAll(async () => {
  await closeMongoConnection();
}, 10000);

// Force Jest to exit after all tests
process.on('SIGINT', async () => {
  if (client) {
    await client.close(true);
  }
  process.exit(0);
});

process.on('SIGTERM', async () => {
  if (client) {
    await client.close(true);
  }
  process.exit(0);
});
