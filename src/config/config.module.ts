import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { MongoConfig } from './mongo.config';

@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  providers: [MongoConfig],
  exports: [MongoConfig],
})
export class ConfigModule {}
