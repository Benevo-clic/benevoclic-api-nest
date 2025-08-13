import { Test, TestingModule } from '@nestjs/testing';
import { SettingsRepository } from './settings.repository';
import { MongoClient, ObjectId } from 'mongodb';
import { VolunteerSettings } from '../entities/volunteer-settings.entity';
import { AssociationSettings } from '../entities/association-settings.entity';

describe('SettingsRepository', () => {
  let repository: SettingsRepository;
  let mockMongoClient: jest.Mocked<MongoClient>;
  let mockVolunteerCollection: any;
  let mockAssociationCollection: any;

  const mockVolunteerSettings: VolunteerSettings & { _id: ObjectId } = {
    _id: new ObjectId(),
    userId: 'test-user-id',
    profileVisibility: true,
    locationSharing: false,
    activitySharing: true,
    twoFactor: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockAssociationSettings: AssociationSettings & { _id: ObjectId } = {
    _id: new ObjectId(),
    associationId: 'test-association-id',
    profileVisibility: true,
    contactInfoVisibility: false,
    eventVisibility: true,
    volunteerListVisibility: false,
    twoFactor: false,
    loginNotifications: true,
    siretVerification: true,
    autoApproveVolunteers: false,
    volunteerLimits: true,
    participantLimits: true,
    eventApproval: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    mockVolunteerCollection = {
      findOne: jest.fn(),
      insertOne: jest.fn(),
      updateOne: jest.fn(),
      createIndex: jest.fn(),
    };

    mockAssociationCollection = {
      findOne: jest.fn(),
      insertOne: jest.fn(),
      updateOne: jest.fn(),
      createIndex: jest.fn(),
    };

    mockMongoClient = {
      db: jest.fn().mockReturnValue({
        collection: jest.fn().mockImplementation((name: string) => {
          if (name === 'volunteer_settings') {
            return mockVolunteerCollection;
          }
          if (name === 'association_settings') {
            return mockAssociationCollection;
          }
          return mockVolunteerCollection; // fallback
        }),
      }),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SettingsRepository,
        {
          provide: 'MONGODB_CONNECTION',
          useValue: mockMongoClient,
        },
      ],
    }).compile();

    repository = module.get<SettingsRepository>(SettingsRepository);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('findVolunteerSettingsByUserId', () => {
    it('should return volunteer settings when found', async () => {
      mockVolunteerCollection.findOne.mockResolvedValue(mockVolunteerSettings);

      const result = await repository.findVolunteerSettingsByUserId('test-user-id');

      expect(result).toEqual(mockVolunteerSettings);
      expect(mockVolunteerCollection.findOne).toHaveBeenCalledWith({ userId: 'test-user-id' });
    });

    it('should return null when volunteer settings not found', async () => {
      mockVolunteerCollection.findOne.mockResolvedValue(null);

      const result = await repository.findVolunteerSettingsByUserId('test-user-id');

      expect(result).toBeNull();
      expect(mockVolunteerCollection.findOne).toHaveBeenCalledWith({ userId: 'test-user-id' });
    });
  });

  describe('createVolunteerSettings', () => {
    it('should create volunteer settings', async () => {
      const settingsData = {
        userId: 'test-user-id',
        profileVisibility: true,
        locationSharing: false,
        activitySharing: true,
        twoFactor: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockVolunteerCollection.insertOne.mockResolvedValue({
        insertedId: mockVolunteerSettings._id,
      });
      mockVolunteerCollection.findOne.mockResolvedValue(mockVolunteerSettings);

      const result = await repository.createVolunteerSettings(settingsData);

      expect(result.userId).toBe(mockVolunteerSettings.userId);
      expect(result.profileVisibility).toBe(mockVolunteerSettings.profileVisibility);
      expect(result.locationSharing).toBe(mockVolunteerSettings.locationSharing);
      expect(result.activitySharing).toBe(mockVolunteerSettings.activitySharing);
      expect(result.twoFactor).toBe(mockVolunteerSettings.twoFactor);
      expect(mockVolunteerCollection.insertOne).toHaveBeenCalledWith({
        ...settingsData,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
    });
  });

  describe('upsertVolunteerSettings', () => {
    it('should upsert volunteer settings', async () => {
      const updateData = {
        profileVisibility: false,
        locationSharing: true,
      };

      mockVolunteerCollection.updateOne.mockResolvedValue({ modifiedCount: 1 });
      mockVolunteerCollection.findOne.mockResolvedValue({
        ...mockVolunteerSettings,
        ...updateData,
      });

      const result = await repository.upsertVolunteerSettings('test-user-id', updateData);

      expect(result.profileVisibility).toBe(false);
      expect(result.locationSharing).toBe(true);
      expect(mockVolunteerCollection.updateOne).toHaveBeenCalledWith(
        { userId: 'test-user-id' },
        {
          $set: expect.objectContaining({
            ...updateData,
            updatedAt: expect.any(Date),
          }),
        },
      );
    });
  });

  describe('findAssociationSettingsByAssociationId', () => {
    it('should return association settings when found', async () => {
      mockAssociationCollection.findOne.mockResolvedValue(mockAssociationSettings);

      const result = await repository.findAssociationSettingsByAssociationId('test-association-id');

      expect(result).toEqual(mockAssociationSettings);
      expect(mockAssociationCollection.findOne).toHaveBeenCalledWith({
        associationId: 'test-association-id',
      });
    });

    it('should return null when association settings not found', async () => {
      mockAssociationCollection.findOne.mockResolvedValue(null);

      const result = await repository.findAssociationSettingsByAssociationId('test-association-id');

      expect(result).toBeNull();
      expect(mockAssociationCollection.findOne).toHaveBeenCalledWith({
        associationId: 'test-association-id',
      });
    });
  });

  describe('createAssociationSettings', () => {
    it('should create association settings', async () => {
      const settingsData = {
        associationId: 'test-association-id',
        profileVisibility: true,
        contactInfoVisibility: false,
        eventVisibility: true,
        volunteerListVisibility: false,
        twoFactor: false,
        loginNotifications: true,
        siretVerification: true,
        autoApproveVolunteers: false,
        volunteerLimits: true,
        participantLimits: true,
        eventApproval: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockAssociationCollection.insertOne.mockResolvedValue({
        insertedId: mockAssociationSettings._id,
      });
      mockAssociationCollection.findOne.mockResolvedValue(mockAssociationSettings);

      const result = await repository.createAssociationSettings(settingsData);

      expect(result.associationId).toBe(mockAssociationSettings.associationId);
      expect(result.profileVisibility).toBe(mockAssociationSettings.profileVisibility);
      expect(result.contactInfoVisibility).toBe(mockAssociationSettings.contactInfoVisibility);
      expect(result.eventVisibility).toBe(mockAssociationSettings.eventVisibility);
      expect(result.volunteerListVisibility).toBe(mockAssociationSettings.volunteerListVisibility);
      expect(result.twoFactor).toBe(mockAssociationSettings.twoFactor);
      expect(result.loginNotifications).toBe(mockAssociationSettings.loginNotifications);
      expect(result.siretVerification).toBe(mockAssociationSettings.siretVerification);
      expect(result.autoApproveVolunteers).toBe(mockAssociationSettings.autoApproveVolunteers);
      expect(result.volunteerLimits).toBe(mockAssociationSettings.volunteerLimits);
      expect(result.participantLimits).toBe(mockAssociationSettings.participantLimits);
      expect(result.eventApproval).toBe(mockAssociationSettings.eventApproval);
      expect(mockAssociationCollection.insertOne).toHaveBeenCalledWith({
        ...settingsData,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
    });
  });

  describe('upsertAssociationSettings', () => {
    it('should upsert association settings', async () => {
      const updateData = {
        profileVisibility: false,
        contactInfoVisibility: true,
      };

      mockAssociationCollection.updateOne.mockResolvedValue({ modifiedCount: 1 });
      mockAssociationCollection.findOne.mockResolvedValue({
        ...mockAssociationSettings,
        ...updateData,
      });

      const result = await repository.upsertAssociationSettings('test-association-id', updateData);

      expect(result.profileVisibility).toBe(false);
      expect(result.contactInfoVisibility).toBe(true);
      expect(mockAssociationCollection.updateOne).toHaveBeenCalledWith(
        { associationId: 'test-association-id' },
        {
          $set: expect.objectContaining({
            ...updateData,
            updatedAt: expect.any(Date),
          }),
        },
      );
    });
  });
});
