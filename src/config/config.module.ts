import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { MongoConfig } from './mongo.config';
import redisConfig from './redis.config';

@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      load: [redisConfig],
    }),
  ],
  providers: [MongoConfig],
  exports: [MongoConfig],
})
export class ConfigModule {}
