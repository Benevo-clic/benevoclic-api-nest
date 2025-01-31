import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';

describe('AppController', () => {
  let controller: AppController;
  let moduleRef: TestingModule;
  let appService: AppService;

  beforeEach(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
        }),
        DatabaseModule,
      ],
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    controller = moduleRef.get<AppController>(AppController);
    appService = moduleRef.get<AppService>(AppService);
  });

  afterEach(async () => {
    await appService.onApplicationShutdown();
  });

  afterAll(async () => {
    await moduleRef.close();
  });

  describe('root', () => {
    it('should confirm MongoDB connection', async () => {
      const result = await controller.getHello();
      expect(result).toBe('Connexion MongoDB OK!');
    });
  });
});
