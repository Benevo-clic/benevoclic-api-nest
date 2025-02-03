import { Module } from '@nestjs/common';
import { ConfigModule } from '../config/config.module';
import { MongoConfig } from '../config/mongo.config';
import { mongodbProvider } from './mongodb.provider';

@Module({
  imports: [ConfigModule],
  providers: [MongoConfig, mongodbProvider],
  exports: [mongodbProvider],
})
export class DatabaseModule {}
