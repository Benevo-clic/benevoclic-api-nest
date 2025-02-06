import { Inject, Injectable } from '@nestjs/common';
import { MONGODB_CONNECTION } from '../../../database/mongodb.provider';
import { MongoClient } from 'mongodb';
import { DatabaseCollection } from '../../../common/enums/database.collection';
import { Volunteer } from '../entities/volunteer.entity';

@Injectable()
export class VolunteerRepository {
  constructor(
    @Inject(MONGODB_CONNECTION)
    private readonly mongoClient: MongoClient,
  ) {}

  private get collection() {
    return this.mongoClient.db().collection<Volunteer>(DatabaseCollection.VOLUNTEER);
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

  async remove(id: string) {
    return await this.collection.deleteOne({ volunteerId: id });
  }

  async update(id: string, volunteer: Partial<Volunteer>) {
    await this.collection.updateOne({ volunteerId: id }, { $set: volunteer });
    return await this.findById(id);
  }
}
