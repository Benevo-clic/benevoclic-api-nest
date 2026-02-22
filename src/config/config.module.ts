import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { MongoConfig } from './mongo.config';
import { PostgresConfig } from './postgres.config';

@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  providers: [MongoConfig, PostgresConfig],
  exports: [MongoConfig, PostgresConfig],
})
export class ConfigModule {}
