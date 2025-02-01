import { Inject, Injectable } from '@nestjs/common';
import { MongoClient } from 'mongodb';
import { MONGODB_CONNECTION } from '../database/mongodb.provider';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';

@Injectable()
export class AnnouncementRepository {
  constructor(
    @Inject(MONGODB_CONNECTION)
    private readonly mongoClient: MongoClient,
  ) {}

  private get collection() {
    return this.mongoClient.db().collection('announcements');
  }

  async findAll() {
    return this.collection.find().toArray();
  }

  async create(announcement: CreateAnnouncementDto) {
    const result = await this.collection.insertOne(announcement);
    return { id: result.insertedId, ...announcement };
  }
}
