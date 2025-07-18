import { BadRequestException, Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { Collection, MongoClient, ObjectId, ClientSession } from 'mongodb';

import { Announcement } from '../entities/announcement.entity';
import { AnnouncementStatus } from '../interfaces/announcement.interface';
import { DatabaseCollection } from '../../../common/enums/database.collection';
import { FilterAnnouncementDto } from '../dto/filter-announcement.dto';
import * as fs from 'fs';
import * as path from 'path';
import { sampleAnnouncements } from './__mocks__/announcement.init';

export interface FilterAnnouncementResponse {
  annonces: Announcement[];
  meta: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

@Injectable()
export class AnnouncementRepository implements OnModuleInit {
  constructor(
    @Inject('MONGODB_CONNECTION')
    private readonly mongoClient: MongoClient,
  ) {}

  private get collection() {
    return this.mongoClient.db().collection<Announcement>(DatabaseCollection.ANNOUNCEMENT);
  }
  async findAll(): Promise<any[]> {
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
      { _id: new ObjectId(id) },
      {
        $set: {
          ...updateData,
          updatedAt: new Date(),
        },
      },
    );
  }

  async updateAssociationNameByAssociationId(
    associationId: string,
    associationName: string,
  ): Promise<void> {
    await this.collection.updateMany({ associationId }, { $set: { associationName } });
  }

  async findVolunteerInVolunteersByVolunteerId(volunteerId: string): Promise<Announcement[]> {
    return this.collection.find({ 'volunteers.id': volunteerId }).toArray();
  }

  async findParticipantInParticipantsByParticipantId(
    participantId: string,
  ): Promise<Announcement[]> {
    return this.collection.find({ 'participants.id': participantId }).toArray();
  }

  async removeVolunteerEverywhere(volunteerId: string): Promise<number> {
    const result = await this.collection.updateMany({}, [
      {
        $set: {
          hadInVolunteers: { $in: [volunteerId, '$volunteers.id'] },
        },
      },
      {
        $set: {
          volunteers: {
            $filter: {
              input: '$volunteers',
              cond: { $ne: ['$$this.id', volunteerId] },
            },
          },
          volunteersWaiting: {
            $filter: {
              input: '$volunteersWaiting',
              cond: { $ne: ['$$this.id', volunteerId] },
            },
          },
        },
      },
      {
        $set: {
          nbVolunteers: {
            $cond: ['$hadInVolunteers', { $subtract: ['$nbVolunteers', 1] }, '$nbVolunteers'],
          },
        },
      },
      { $unset: 'hadInVolunteers' },
    ]);

    return result.modifiedCount;
  }

  async removeParticipantEverywhere(participantId: string): Promise<number> {
    const pipeline = [
      {
        $set: {
          hadInParticipants: { $in: [participantId, '$participants.id'] },
        },
      },
      {
        $set: {
          participants: {
            $filter: {
              input: '$participants',
              cond: { $ne: ['$$this.id', participantId] },
            },
          },
        },
      },
      {
        $set: {
          nbParticipants: {
            $cond: ['$hadInParticipants', { $subtract: ['$nbParticipants', 1] }, '$nbParticipants'],
          },
        },
      },
      {
        $unset: 'hadInParticipants',
      },
    ];

    const result = await this.collection.updateMany({}, pipeline);
    return result.modifiedCount;
  }

  async onModuleInit() {
    await this.collection.createIndex(
      { associationId: 1 },
      {
        name: 'idx_ann_associationId',
        background: true,
        sparse: false,
      },
    );

    await this.collection.createIndex(
      { nameEvent: 'text', description: 'text' },
      {
        name: 'idx_ann_nameEvent_description_text',
        background: true,
        weights: { nameEvent: 10, description: 5 },
        default_language: 'none',
      },
    );
    await this.collection.createIndex(
      { datePublication: 1 },
      {
        name: 'idx_ann_datePublication',
        background: true,
        sparse: true,
      },
    );
    await this.collection.createIndex(
      { dateEvent: 1 },
      {
        name: 'idx_ann_dateEvent',
        background: true,
        sparse: true,
      },
    );
    await this.collection.createIndex(
      { hoursEvent: 1 },
      {
        name: 'idx_ann_hoursEvent',
        background: true,
        sparse: true,
      },
    );

    await this.collection.createIndex(
      { tags: 1 },
      {
        name: 'idx_ann_tags',
        background: true,
        sparse: true,
      },
    );

    const volunteerPaths = ['participants.id', 'volunteers.id', 'volunteersWaiting.id'];
    for (const path of volunteerPaths) {
      await this.collection.createIndex(
        { [path]: 1 },
        {
          name: `idx_ann_${path.replace('.', '_')}`,
          background: true,
          sparse: true,
        },
      );
    }
    await this.collection.createIndex(
      { locationAnnouncement: '2dsphere' },
      {
        name: 'idx_ann_location_geo',
        background: true,
        sparse: true,
      },
    );
    await this.initMockData();
  }

  async initMockData() {
    await this.collection.deleteMany({});
    await this.collection.insertMany(sampleAnnouncements as any[]);
  }

  async findWithAggregation(dto: FilterAnnouncementDto): Promise<FilterAnnouncementResponse> {
    const {
      nameEvent,
      description,
      status,
      hoursEventFrom,
      hoursEventTo,
      dateEventFrom,
      dateEventTo,
      publicationInterval,
      datePublicationFrom,
      datePublicationTo,
      tags,
      associationName,
      latitude,
      longitude,
      radius,
      sort,
      page = 1,
      limit = 9,
    } = dto;

    const pipeline: any[] = [];

    // 1) GEOJSON si besoin
    if (latitude !== undefined && longitude !== undefined && radius) {
      pipeline.push({
        $geoNear: {
          near: { type: 'Point', coordinates: [longitude, latitude] },
          distanceField: 'dist.calculated',
          maxDistance: radius,
          spherical: true,
        },
      });
    }

    // 2) Convertir les dates stockées en string en BSON Date
    pipeline.push({
      $addFields: {
        _dateEventAsDate: { $toDate: '$dateEvent' },
        _datePublicationAsDate: { $toDate: '$datePublication' },
      },
    });

    // 3) Construction du match
    const match: any = {};

    if (nameEvent) match.nameEvent = { $regex: nameEvent, $options: 'i' };
    if (description) match.description = { $regex: description, $options: 'i' };
    if (status) match.status = status;

    if (hoursEventFrom || hoursEventTo) {
      match.hoursEvent = {};
      if (hoursEventFrom) match.hoursEvent.$gte = hoursEventFrom;
      if (hoursEventTo) match.hoursEvent.$lte = hoursEventTo;
    }

    if (dateEventFrom || dateEventTo) {
      match._dateEventAsDate = {};
      if (dateEventFrom) match._dateEventAsDate.$gte = new Date(dateEventFrom);
      if (dateEventTo) match._dateEventAsDate.$lte = new Date(dateEventTo);
    }

    // publicationInterval ou intervalle absolu
    if (publicationInterval) {
      const now = new Date();
      let threshold: Date;
      switch (publicationInterval) {
        case '1h':
          threshold = new Date(now.getTime() - 1 * 60 * 60 * 1000);
          break;
        case '5h':
          threshold = new Date(now.getTime() - 5 * 60 * 60 * 1000);
          break;
        case '1d':
          threshold = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case '1w':
          threshold = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '1M':
          threshold = new Date(now.setMonth(now.getMonth() - 1));
          break;
        default:
          throw new BadRequestException('Intervalle de publication invalide');
      }
      match._datePublicationAsDate = { $gte: threshold };
    } else if (datePublicationFrom || datePublicationTo) {
      match._datePublicationAsDate = {};
      if (datePublicationFrom) match._datePublicationAsDate.$gte = new Date(datePublicationFrom);
      if (datePublicationTo) match._datePublicationAsDate.$lte = new Date(datePublicationTo);
    }

    if (tags?.length) match.tags = { $in: tags };
    if (associationName) match.associationName = associationName;

    if (Object.keys(match).length) {
      pipeline.push({ $match: match });
    }

    // 4) Tri
    let sortOption: Record<string, 1 | -1> = {};
    switch (sort) {
      case 'dateEvent_asc':
        sortOption = { _dateEventAsDate: 1 };
        break;
      case 'dateEvent_desc':
        sortOption = { _dateEventAsDate: -1 };
        break;
      case 'datePublication_desc':
      default:
        sortOption = { _datePublicationAsDate: -1 };
        break;
    }
    pipeline.push({ $sort: sortOption });

    // 5) Facet pagination + total
    pipeline.push({
      $facet: {
        docs: [{ $skip: (page - 1) * limit }, { $limit: limit }],
        meta: [{ $count: 'total' }],
      },
    });
    pipeline.push({
      $addFields: { total: { $arrayElemAt: ['$meta.total', 0] } },
    });
    pipeline.push({ $project: { meta: 0 } });

    // 6) Exécution & retour
    const [result] = await this.collection.aggregate(pipeline).toArray();
    const total = result?.total ?? 0;

    return {
      annonces: result.docs,
      meta: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }
}
