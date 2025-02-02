import { Injectable, Inject } from '@nestjs/common';
import { MongoClient } from 'mongodb';
import { MONGODB_CONNECTION } from '../../database/mongodb.provider';
import { Association } from './entities/association.entity';
import { Location } from './type/association.type';

@Injectable()
export class AssociationRepository {
  constructor(
    @Inject(MONGODB_CONNECTION)
    private readonly mongoClient: MongoClient,
  ) {}

  private get collection() {
    return this.mongoClient.db().collection<Association>('associations');
  }

  async update(id: string, updateData: Partial<Association>): Promise<void> {
    await this.collection.updateOne({ _id: id }, { $set: updateData });
  }

  async updateLocation(id: string, location: Location): Promise<void> {
    await this.collection.updateOne({ _id: id }, { $set: { ...location } });
  }

  async findById(id: string): Promise<Association | null> {
    return this.collection.findOne({ _id: id });
  }

  findByEmail(email: string) {
    return this.collection.findOne({ email });
  }

  async create(association: Association): Promise<Association> {
    const result = await this.collection.insertOne(association);
    return result.insertedId ? association : null;
  }

  async findAll(): Promise<Association[]> {
    return this.collection.find().toArray();
  }
}
