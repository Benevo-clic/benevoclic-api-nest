// src/api/settings/repository/settings.repository.ts
import { Inject, Injectable, Logger, NotFoundException, OnModuleInit } from '@nestjs/common';
import { Collection, MongoClient } from 'mongodb';
import { MONGODB_CONNECTION } from '../../../database/mongodb.provider';
import { VolunteerSettings } from '../entities/volunteer-settings.entity';
import { AssociationSettings } from '../entities/association-settings.entity';

@Injectable()
export class SettingsRepository implements OnModuleInit {
  private readonly logger = new Logger(SettingsRepository.name);

  constructor(
    @Inject(MONGODB_CONNECTION)
    private readonly mongoClient: MongoClient,
  ) {}

  private get db() {
    return this.mongoClient.db();
  }

  private get volunteerSettingsCollection(): Collection<VolunteerSettings> {
    return this.db.collection<VolunteerSettings>('volunteer_settings');
  }

  private get associationSettingsCollection(): Collection<AssociationSettings> {
    return this.db.collection<AssociationSettings>('association_settings');
  }

  async onModuleInit() {
    try {
      await this.volunteerSettingsCollection.createIndex(
        { userId: 1 },
        { unique: true, background: true, name: 'idx_volunteer_settings_userId' },
      );
      await this.associationSettingsCollection.createIndex(
        { associationId: 1 },
        { unique: true, background: true, name: 'idx_association_settings_associationId' },
      );
    } catch (e) {
      this.logger.error('Erreur création d’index settings', e as any);
    }
  }

  // ---------- VOLUNTEER ----------

  async findVolunteerSettingsByUserId(userId: string) {
    return this.volunteerSettingsCollection.findOne({ userId });
  }

  async createVolunteerSettings(settings: VolunteerSettings) {
    const now = new Date();
    const toInsert: VolunteerSettings = {
      userId: settings.userId,
      profileVisibility: settings.profileVisibility ?? true,
      locationSharing: settings.locationSharing ?? false,
      activitySharing: settings.activitySharing ?? true,
      twoFactor: settings.twoFactor ?? false,
      createdAt: now,
      updatedAt: now,
    };
    const result = await this.volunteerSettingsCollection.insertOne(toInsert);
    return { ...toInsert, _id: result.insertedId as any };
  }

  async updateVolunteerSettings(userId: string, settings: Partial<VolunteerSettings>) {
    const now = new Date();

    const res = await this.volunteerSettingsCollection.updateOne(
      { userId },
      { $set: { ...settings, updatedAt: now } },
    );

    if (res.matchedCount === 0) {
      throw new NotFoundException('Volunteer settings not found');
    }

    const doc = await this.volunteerSettingsCollection.findOne({ userId });
    if (!doc) throw new NotFoundException('Volunteer settings not found');
    return doc;
  }

  async upsertVolunteerSettings(userId: string, settings: Partial<VolunteerSettings>) {
    const now = new Date();

    await this.volunteerSettingsCollection.updateOne(
      { userId },
      {
        $set: { ...settings, updatedAt: now },
      },
    );

    const doc = await this.volunteerSettingsCollection.findOne({ userId });
    if (!doc) throw new Error('Upsert volunteer settings failed');
    return doc;
  }

  async findAssociationSettingsByAssociationId(associationId: string) {
    return this.associationSettingsCollection.findOne({ associationId });
  }

  async createAssociationSettings(settings: AssociationSettings) {
    const now = new Date();
    const toInsert: AssociationSettings = {
      associationId: settings.associationId,
      profileVisibility: settings.profileVisibility ?? true,
      contactInfoVisibility: settings.contactInfoVisibility ?? false,
      eventVisibility: settings.eventVisibility ?? true,
      volunteerListVisibility: settings.volunteerListVisibility ?? false,
      twoFactor: settings.twoFactor ?? false,
      loginNotifications: settings.loginNotifications ?? true,
      siretVerification: settings.siretVerification ?? true,
      autoApproveVolunteers: settings.autoApproveVolunteers ?? false,
      volunteerLimits: settings.volunteerLimits ?? true,
      eventApproval: settings.eventApproval ?? true,
      createdAt: now,
      updatedAt: now,
    };
    const result = await this.associationSettingsCollection.insertOne(toInsert);
    return { ...toInsert, _id: result.insertedId as any };
  }

  async updateAssociationSettings(associationId: string, settings: Partial<AssociationSettings>) {
    const now = new Date();

    const res = await this.associationSettingsCollection.updateOne(
      { associationId },
      { $set: { ...settings, updatedAt: now } },
    );

    if (res.matchedCount === 0) {
      throw new NotFoundException('Association settings not found');
    }

    const doc = await this.associationSettingsCollection.findOne({ associationId });
    if (!doc) throw new NotFoundException('Association settings not found');
    return doc;
  }

  async upsertAssociationSettings(associationId: string, settings: Partial<AssociationSettings>) {
    const now = new Date();

    await this.associationSettingsCollection.updateOne(
      { associationId },
      {
        $set: { ...settings, updatedAt: now },
      },
    );

    const doc = await this.associationSettingsCollection.findOne({ associationId });
    if (!doc) throw new Error('Upsert association settings failed');
    return doc;
  }
}
