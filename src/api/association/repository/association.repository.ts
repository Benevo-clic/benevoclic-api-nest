import { Injectable, Inject } from '@nestjs/common';
import { MongoClient } from 'mongodb';
import { MONGODB_CONNECTION } from '../../../database/mongodb.provider';
import { Association } from '../entities/association.entity';
import { Location } from '../../../common/type/usersInfo.type';

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

  async findById(id: string): Promise<Association | null> {
    return this.collection.findOne({ _id: id });
  }

  async create(association: Association): Promise<Association> {
    const associationInsertOneResult = await this.collection.insertOne(association);
    return associationInsertOneResult.insertedId ? association : null;
  }

  async findAll(): Promise<Association[]> {
    return this.collection.find().toArray();
  }

  async remove(id: string) {
    await this.collection.deleteOne({ _id: id });
  }
}
