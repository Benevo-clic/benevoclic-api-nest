import { ConfigModule } from '@nestjs/config';

export const TestConfigModule = ConfigModule.forRoot({
  envFilePath: '.env.test',
  isGlobal: true,
});

export const testMongoConfig = {
  uri: 'mongodb://admin:password123@localhost:27017/benevoclic-test?authSource=admin',
  dbName: 'benevoclic-test',
};
