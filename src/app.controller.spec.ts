import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { mongoConfig } from './config/mongo.config';
import { getConnectionToken } from '@nestjs/mongoose';

describe('AppController', () => {
  let appController: AppController;
  let moduleRef: TestingModule;

  beforeEach(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot(),
        MongooseModule.forRoot(mongoConfig.mongoConfig(), {
          dbName: mongoConfig.database(),
        }),
      ],
      controllers: [AppController],
    }).compile();

    appController = moduleRef.get<AppController>(AppController);
  });

  afterEach(async () => {
    const connection = moduleRef.get(getConnectionToken());
    await connection.close();
    await moduleRef.close();
  });

  describe('root', () => {
    it('should return MongoDB connection status', async () => {
      const result = await appController.getHello();
      expect(result).toContain('Connexion à MongoDB');
    });
  });
});
