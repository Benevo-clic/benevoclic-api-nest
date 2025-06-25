import { Inject, Injectable } from '@nestjs/common';
import { MONGODB_CONNECTION } from '../../../database/mongodb.provider';
import { MongoClient } from 'mongodb';
import { DatabaseCollection } from '../../../common/enums/database.collection';
import { FavoritesAnnouncement } from '../entities/favorites-announcement.entity';

@Injectable()
export class FavoritesAnnouncementRepository {
  constructor(
    @Inject(MONGODB_CONNECTION)
    private readonly mongoClient: MongoClient,
  ) {}

  private get collection() {
    return this.mongoClient.db().collection<FavoritesAnnouncement>(DatabaseCollection.FAVORITES);
  }

  async findByVolunteerIdAndAnnouncementId(volunteerId: string, announcementId: string) {
    return await this.collection.findOne(
      { volunteerId, announcementId },
      { projection: { _id: 0, __v: 0 } },
    );
  }

  async create(favoritesAnnouncement: FavoritesAnnouncement) {
    const favoritesAnnouncementInsertOneResult = await this.collection.insertOne({
      ...favoritesAnnouncement,
    });
    return favoritesAnnouncementInsertOneResult.insertedId ? favoritesAnnouncement : null;
  }

  async findAll() {
    return await this.collection.find().toArray();
  }

  async removeByVolunteerIdAndAnnouncementId(volunteerId: string, announcementId: string) {
    return await this.collection.deleteOne({ volunteerId, announcementId });
  }

  async removeByVolunteerId(volunteerId: string) {
    return await this.collection.deleteMany({ volunteerId });
  }

  async removeByAnnouncementId(announcementId: string) {
    return await this.collection.deleteMany({ announcementId });
  }

  async findAllByVolunteerId(volunteerId: string) {
    return await this.collection.find({ volunteerId }).toArray();
  }

  async findAllByAnnouncementId(announcementId: string) {
    return await this.collection.find({ announcementId }).toArray();
  }
}
