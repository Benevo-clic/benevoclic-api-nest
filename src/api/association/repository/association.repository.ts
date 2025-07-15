import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import { MongoClient } from 'mongodb';
import { MONGODB_CONNECTION } from '../../../database/mongodb.provider';
import { Association } from '../entities/association.entity';
import { DatabaseCollection } from '../../../common/enums/database.collection';
import { FindAssociationDto } from '../dto/find-association.dto';
import { InfoAssociation, InfoVolunteer } from '../type/association.type';

@Injectable()
export class AssociationRepository implements OnModuleInit {
  constructor(
    @Inject(MONGODB_CONNECTION)
    private readonly mongoClient: MongoClient,
  ) {}

  private get collection() {
    return this.mongoClient.db().collection<Association>(DatabaseCollection.ASSOCIATION);
  }
  async onModuleInit() {
    await this.collection.createIndex(
      { associationId: 1 },
      {
        unique: true,
        background: true,
        name: 'idx_asso_associationId',
        sparse: true,
        collation: {
          locale: 'en',
          strength: 2,
        },
      },
    );

    const volunteerPaths = ['volunteers.id', 'volunteersWaiting.id'];
    for (const path of volunteerPaths) {
      await this.collection.createIndex(
        { [path]: 1 },
        {
          name: `idx_asso_${path.replace('.', '_')}`,
          background: true,
          sparse: true,
        },
      );
    }
    await this.collection.createIndex(
      { locationAssociation: '2dsphere' },
      {
        name: 'idx_asso_location_geo',
        background: true,
        sparse: true,
      },
    );
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

  async findAssociationsByVolunteer(volunteerId: string): Promise<FindAssociationDto[]> {
    return await this.collection.find({ 'volunteers.id': volunteerId }).toArray();
  }

  async findAssociationsByVolunteerWaiting(volunteerId: string): Promise<FindAssociationDto[]> {
    return await this.collection.find({ 'volunteersWaiting.id': volunteerId }).toArray();
  }

  async findVolunteersInWaitingList(
    associationId: string,
    volunteerId: string,
  ): Promise<InfoVolunteer | null> {
    const association = await this.collection.findOne({
      associationId: associationId,
      'volunteersWaiting.id': volunteerId,
    });

    if (!association) {
      return null;
    }

    return association.volunteersWaiting.find(volunteer => volunteer.id === volunteerId) || null;
  }

  async removeVolunteerFromAssociation(
    associationId: string,
    volunteerId: string,
  ): Promise<string> {
    await this.collection.updateOne(
      { associationId: associationId },
      { $pull: { volunteers: { id: volunteerId } } },
    );
    return volunteerId;
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

  async findByEmail(email: string) {
    return this.collection.findOne({ email: { $eq: email } });
  }

  async findVolunteersList(associationId: string, volunteerId: string) {
    const association = await this.collection.findOne({
      associationId: associationId,
      'volunteers.id': volunteerId,
    });

    if (!association) {
      return null;
    }

    return association.volunteers.find(volunteer => volunteer.id === volunteerId) || null;
  }

  async findAllAssociationsVolunteerFromWaitingList(
    volunteerId: string,
  ): Promise<InfoAssociation[]> {
    return this.collection
      .find(
        { 'volunteersWaiting.id': volunteerId },
        { projection: { _id: 0, associationId: 1, associationName: 1 } },
      )
      .toArray();
  }

  async findAllAssociationsVolunteerFromList(volunteerId: string): Promise<InfoAssociation[]> {
    return this.collection
      .find(
        { 'volunteers.id': volunteerId },
        { projection: { _id: 0, associationId: 1, associationName: 1 } },
      )
      .toArray();
  }

  async removeVolunteerEverywhere(volunteerId: string): Promise<number> {
    const result = await this.collection.updateMany(
      {},
      {
        $pull: {
          volunteers: { id: volunteerId },
          volunteersWaiting: { id: volunteerId },
        },
      },
    );
    return result.modifiedCount;
  }
}
