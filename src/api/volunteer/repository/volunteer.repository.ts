import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { MONGODB_CONNECTION } from '../../../database/mongodb.provider';
import { MongoClient } from 'mongodb';
import { DatabaseCollection } from '../../../common/enums/database.collection';
import { Volunteer } from '../entities/volunteer.entity';

@Injectable()
export class VolunteerRepository implements OnModuleInit {
  constructor(
    @Inject(MONGODB_CONNECTION)
    private readonly mongoClient: MongoClient,
  ) {}

  private get collection() {
    return this.mongoClient.db().collection<Volunteer>(DatabaseCollection.VOLUNTEER);
  }

  async onModuleInit() {
    await this.collection.createIndex(
      { volunteerId: 1 },
      {
        unique: true,
        background: true,
        name: 'idx_vol_volunteerId',
        sparse: true,
        collation: {
          locale: 'en',
          strength: 2,
        },
      },
    );

    await this.collection.createIndex(
      { locationVolunteer: '2dsphere' },
      {
        name: 'idx_vol_location_geo',
        background: true,
        sparse: true,
      },
    );
  }

  async findById(uid: string) {
    return await this.collection.findOne({ volunteerId: uid });
  }

  async create(volunteer: Volunteer) {
    const volunteerInsertOneResult = await this.collection.insertOne(volunteer);
    return volunteerInsertOneResult.insertedId ? volunteer : null;
  }

  async findAll() {
    return await this.collection.find().toArray();
  }
  async countAll(): Promise<number> {
    return await this.collection.countDocuments();
  }

  async remove(id: string) {
    return await this.collection.deleteOne({ volunteerId: id });
  }

  async update(id: string, volunteer: Partial<Volunteer>) {
    await this.collection.updateOne({ volunteerId: id }, { $set: volunteer });
    return await this.findById(id);
  }
}
