import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from './config/config.module';
import { mongoConfig } from './config/mongo.config';

@Module({
  imports: [
    NestConfigModule.forRoot(),
    ConfigModule,
    MongooseModule.forRoot(mongoConfig.mongoConfig(), {
      dbName: mongoConfig.database(),
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
