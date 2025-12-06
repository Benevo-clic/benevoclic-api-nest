import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '../config/config.module';
import { MongoConfig } from '../config/mongo.config';
import { PostgresConfig } from '../config/postgres.config';
import { mongodbProvider } from './mongodb.provider';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: PostgresConfig) => config.typeOrmConfig,
      inject: [PostgresConfig],
    }),
  ],
  providers: [MongoConfig, mongodbProvider],
  exports: [mongodbProvider],
})
export class DatabaseModule { }
