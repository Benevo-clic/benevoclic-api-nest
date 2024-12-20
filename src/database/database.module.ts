import { Module } from '@nestjs/common';
import { DatabaseService } from './database.service';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forRoot(
      'mongodb://admin:adminpassword@localhost:27017/benevoclic-api-nest?authSource=admin',
    ),
  ],
  providers: [DatabaseService],
})
export class DatabaseModule {}
