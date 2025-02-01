import { Module } from '@nestjs/common';
import { MongoConfig } from '../config/mongo.config';
import { mongodbProvider } from './mongodb.provider';

@Module({
  providers: [MongoConfig, mongodbProvider],
  exports: [mongodbProvider],
})
export class DatabaseModule {}
