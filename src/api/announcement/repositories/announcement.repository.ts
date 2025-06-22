import { Inject, Injectable } from '@nestjs/common';
import { Collection, MongoClient, ObjectId, ClientSession } from 'mongodb';
import { Announcement } from '../entities/announcement.entity';
import { AnnouncementStatus } from '../interfaces/announcement.interface';
import { DatabaseCollection } from '../../../common/enums/database.collection';

@Injectable()
export class AnnouncementRepository {
  constructor(
    @Inject('MONGODB_CONNECTION')
    private readonly mongoClient: MongoClient,
  ) {}

  private get collection() {
    return this.mongoClient.db().collection<Announcement>(DatabaseCollection.ANNOUNCEMENT);
  }
  async findAll(): Promise<Announcement[]> {
    return await this.collection.find().toArray();
  }

  async findById(id: string): Promise<Announcement> {
    return await this.collection.findOne({ _id: new ObjectId(id) });
  }

  async findByAssociationId(associationId: string): Promise<Announcement[]> {
    return await this.collection.find({ associationId }).toArray();
  }

  async create(announcement: Announcement): Promise<string> {
    const result = await this.collection.insertOne({
      ...announcement,
    });

    return result.insertedId.toString();
  }

  async updateVolunteer(
    id: string,
    announcement: Partial<Announcement>,
  ): Promise<Partial<Announcement>> {
    const collection = this.getCollection();
    await collection.updateOne({ _id: new ObjectId(id) }, { $set: announcement });
    return announcement;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.collection.deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount === 1;
  }

  async deleteByAssociationId(associationId: string): Promise<boolean> {
    const result = await this.collection.deleteMany({ associationId });
    return result.deletedCount > 0;
  }

  private getCollection(): Collection<Announcement> {
    return this.collection;
  }

  async removeVolunteerWaiting(
    id: string,
    volunteerId: string,
    options?: { session?: ClientSession },
  ) {
    await this.collection.updateOne(
      { _id: new ObjectId(id) },
      { $pull: { volunteersWaiting: { id: volunteerId } } },
      options,
    );
  }

  async removeVolunteer(id: string, volunteerId: string, nbVolunteers: number) {
    await this.collection.updateOne(
      { _id: new ObjectId(id) },
      { $pull: { volunteers: { id: volunteerId } }, $set: { nbVolunteers } },
    );
  }

  async removeParticipant(id: string, participantId: string, nbParticipants: number) {
    await this.collection.updateOne(
      { _id: new ObjectId(id) },
      { $pull: { participants: { id: participantId } }, $set: { nbParticipants } },
    );
  }

  async updateStatus(id: string, status: AnnouncementStatus) {
    await this.collection.updateOne({ _id: new ObjectId(id) }, { $set: { status } });
    return this.findById(id);
  }

  async update(id: string, updateData: Partial<Announcement>): Promise<void> {
    await this.collection.updateOne(
      { userId: id },
      {
        $set: {
          ...updateData,
          updatedAt: new Date(),
        },
      },
    );
  }
}
