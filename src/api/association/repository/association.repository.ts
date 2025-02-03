import { Injectable, Inject } from '@nestjs/common';
import { MongoClient } from 'mongodb';
import { MONGODB_CONNECTION } from '../../../database/mongodb.provider';
import { Association } from '../entities/association.entity';
import { DatabaseCollection } from '../../../common/enums/database.collection';

@Injectable()
export class AssociationRepository {
  constructor(
    @Inject(MONGODB_CONNECTION)
    private readonly mongoClient: MongoClient,
  ) {}

  private get collection() {
    return this.mongoClient.db().collection<Association>(DatabaseCollection.ASSOCIATION);
  }

  async update(id: string, updateData: Partial<Association>): Promise<void> {
    await this.collection.updateOne({ associationId: id }, { $set: updateData });
  }

  async findById(id: string): Promise<Association | null> {
    return this.collection.findOne({ associationId: id });
  }

  async create(association: Association): Promise<Association> {
    const associationInsertOneResult = await this.collection.insertOne(association);
    return associationInsertOneResult.insertedId ? association : null;
  }

  async findAll(): Promise<Association[]> {
    return this.collection.find().toArray();
  }

  async remove(id: string) {
    await this.collection.deleteOne({ associationId: id });
  }

  async findAssociationsByVolunteer(volunteerId: string): Promise<Association[]> {
    return await this.collection.find({ 'volunteers.id': volunteerId }).toArray();
  }

  async findAssociationsByVolunteerWaiting(volunteerId: string): Promise<Association[]> {
    return await this.collection.find({ 'volunteersWaiting.id': volunteerId }).toArray();
  }

  async removeVolunteerFromAssociation(associationId: string, volunteerId: string): Promise<void> {
    await this.collection.updateOne(
      { associationId: associationId },
      { $pull: { volunteers: { id: volunteerId } } },
    );
  }

  async removeVolunteerWaitingFromAssociation(
    associationId: string,
    volunteerId: string,
  ): Promise<void> {
    await this.collection.updateOne(
      { associationId: associationId },
      { $pull: { volunteersWaiting: { id: volunteerId } } },
    );
  }
}
