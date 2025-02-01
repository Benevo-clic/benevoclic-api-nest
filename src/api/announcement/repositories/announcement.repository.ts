import { Inject, Injectable } from '@nestjs/common';
import { Collection, MongoClient, ObjectId } from 'mongodb';
import { Announcement } from '../interfaces/announcement.interface';

@Injectable()
export class AnnouncementRepository {
  private readonly collection: Collection<Announcement>;

  constructor(
    @Inject('MONGODB_CONNECTION')
    private readonly mongoClient: MongoClient,
  ) {
    this.collection = this.mongoClient.db('benevoclic').collection<Announcement>('announcements');
  }

  async findAll(): Promise<Announcement[]> {
    return await this.collection.find().toArray();
  }

  async findById(id: string): Promise<Announcement> {
    return await this.collection.findOne({ _id: new ObjectId(id) });
  }

  async create(announcement: Omit<Announcement, '_id'>): Promise<Announcement> {
    const result = await this.collection.insertOne({
      ...announcement,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Announcement);

    return await this.findById(result.insertedId.toString());
  }

  async update(id: string, announcement: Partial<Announcement>): Promise<Announcement> {
    await this.collection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          ...announcement,
          updatedAt: new Date(),
        },
      },
    );

    return await this.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.collection.deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount === 1;
  }

  async findByAssociationId(associationId: string): Promise<Announcement[]> {
    return await this.collection.find({ associationId: new ObjectId(associationId) }).toArray();
  }
}
