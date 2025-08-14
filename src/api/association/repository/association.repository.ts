import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { MongoClient } from 'mongodb';
import { MONGODB_CONNECTION } from '../../../database/mongodb.provider';
import { Association } from '../entities/association.entity';
import { DatabaseCollection } from '../../../common/enums/database.collection';
import { FindAssociationDto } from '../dto/find-association.dto';
import { InfoAssociation, VolunteerAssociationFollowing } from '../type/association.type';

@Injectable()
export class AssociationRepository implements OnModuleInit {
  private readonly logger = new Logger(AssociationRepository.name);

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

    const volunteerPaths = ['volunteers.volunteerId', 'volunteersWaiting.volunteerId'];
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

  async countAll(): Promise<number> {
    return this.collection.countDocuments();
  }

  async remove(id: string) {
    await this.collection.deleteOne({ associationId: id });
  }

  async findAssociationsByVolunteer(volunteerId: string): Promise<FindAssociationDto[]> {
    return await this.collection.find({ 'volunteers.volunteerId': volunteerId }).toArray();
  }

  async findAssociationsByVolunteerWaiting(volunteerId: string): Promise<FindAssociationDto[]> {
    return await this.collection.find({ 'volunteersWaiting.volunteerId': volunteerId }).toArray();
  }

  async findVolunteersInWaitingList(
    associationId: string,
    volunteerId: string,
  ): Promise<VolunteerAssociationFollowing | null> {
    const association = await this.collection.findOne({
      associationId: associationId,
      'volunteersWaiting.volunteerId': volunteerId,
    });

    if (!association) {
      return null;
    }

    return (
      association.volunteersWaiting.find(volunteer => volunteer.volunteerId === volunteerId) || null
    );
  }

  async removeVolunteerFromAssociation(
    associationId: string,
    volunteerId: string,
  ): Promise<string> {
    await this.collection.updateOne(
      { associationId: associationId },
      { $pull: { volunteers: { volunteerId: volunteerId } } },
    );
    return volunteerId;
  }

  async removeVolunteerWaitingFromAssociation(
    associationId: string,
    volunteerId: string,
  ): Promise<void> {
    await this.collection.updateOne(
      { associationId: associationId },
      { $pull: { volunteersWaiting: { volunteerId: volunteerId } } },
    );
  }

  async findByEmail(email: string) {
    return this.collection.findOne({ email: { $eq: email } });
  }

  async findVolunteersList(associationId: string, volunteerId: string) {
    const association = await this.collection.findOne({
      associationId: associationId,
      'volunteers.volunteerId': volunteerId,
    });

    if (!association) {
      return null;
    }

    return association.volunteers.find(volunteer => volunteer.volunteerId === volunteerId) || null;
  }

  async findAllAssociationsVolunteerFromWaitingList(
    volunteerId: string,
  ): Promise<InfoAssociation[]> {
    return this.collection
      .find(
        { 'volunteersWaiting.volunteerId': volunteerId },
        { projection: { _id: 0, associationId: 1, associationName: 1 } },
      )
      .toArray();
  }

  async findAllAssociationsVolunteerFromList(volunteerId: string): Promise<InfoAssociation[]> {
    return await this.collection
      .find(
        { 'volunteers.volunteerId': volunteerId },
        { projection: { _id: 0, associationId: 1, associationName: 1 } },
      )
      .toArray();
  }

  async removeVolunteerEverywhere(volunteerId: string): Promise<number> {
    const result = await this.collection.updateMany(
      {},
      {
        $pull: {
          volunteers: { volunteerId: volunteerId },
          volunteersWaiting: { volunteerId: volunteerId },
        },
      },
    );
    return result.modifiedCount;
  }
}
