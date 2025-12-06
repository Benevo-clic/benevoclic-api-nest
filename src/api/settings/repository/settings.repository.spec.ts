import { Test, TestingModule } from '@nestjs/testing';
import { SettingsRepository } from './settings.repository';
import { VolunteerSettings } from '../entities/volunteer-settings.entity';
import { AssociationSettings } from '../entities/association-settings.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';

describe('SettingsRepository', () => {
  let repository: SettingsRepository;
  let mockVolunteerRepository: Partial<Repository<VolunteerSettings>>;
  let mockAssociationRepository: Partial<Repository<AssociationSettings>>;

  const mockVolunteerSettings: VolunteerSettings = {
    userId: 'test-user-id',
    profileVisibility: true,
    locationSharing: false,
    activitySharing: true,
    twoFactor: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockAssociationSettings: AssociationSettings = {
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
    mockVolunteerRepository = {
      findOneBy: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    mockAssociationRepository = {
      findOneBy: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SettingsRepository,
        {
          provide: getRepositoryToken(VolunteerSettings),
          useValue: mockVolunteerRepository,
        },
        {
          provide: getRepositoryToken(AssociationSettings),
          useValue: mockAssociationRepository,
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
      (mockVolunteerRepository.findOneBy as jest.Mock).mockResolvedValue(mockVolunteerSettings);

      const result = await repository.findVolunteerSettingsByUserId('test-user-id');

      expect(result).toEqual(mockVolunteerSettings);
      expect(mockVolunteerRepository.findOneBy).toHaveBeenCalledWith({ userId: 'test-user-id' });
    });

    it('should return null when volunteer settings not found', async () => {
      (mockVolunteerRepository.findOneBy as jest.Mock).mockResolvedValue(null);

      const result = await repository.findVolunteerSettingsByUserId('test-user-id');

      expect(result).toBeNull();
      expect(mockVolunteerRepository.findOneBy).toHaveBeenCalledWith({ userId: 'test-user-id' });
    });
  });

  describe('createVolunteerSettings', () => {
    it('should create volunteer settings', async () => {
      (mockVolunteerRepository.create as jest.Mock).mockReturnValue(mockVolunteerSettings);
      (mockVolunteerRepository.save as jest.Mock).mockResolvedValue(mockVolunteerSettings);

      const result = await repository.createVolunteerSettings(mockVolunteerSettings);

      expect(result).toEqual(mockVolunteerSettings);
      expect(mockVolunteerRepository.create).toHaveBeenCalledWith(mockVolunteerSettings);
      expect(mockVolunteerRepository.save).toHaveBeenCalledWith(mockVolunteerSettings);
    });
  });

  describe('upsertVolunteerSettings', () => {
    it('should update existing volunteer settings', async () => {
      const updateData = { profileVisibility: false };
      (mockVolunteerRepository.findOneBy as jest.Mock).mockResolvedValue(mockVolunteerSettings);
      (mockVolunteerRepository.update as jest.Mock).mockResolvedValue({ affected: 1 });

      await repository.upsertVolunteerSettings('test-user-id', updateData);

      expect(mockVolunteerRepository.update).toHaveBeenCalledWith(
        { userId: 'test-user-id' },
        updateData,
      );
    });

    it('should create new volunteer settings if not exists', async () => {
      const updateData = { profileVisibility: false };
      (mockVolunteerRepository.findOneBy as jest.Mock).mockResolvedValue(null);
      (mockVolunteerRepository.save as jest.Mock).mockResolvedValue({
        ...mockVolunteerSettings,
        ...updateData,
      });

      await repository.upsertVolunteerSettings('test-user-id', updateData);

      expect(mockVolunteerRepository.save).toHaveBeenCalledWith({
        userId: 'test-user-id',
        ...updateData,
      });
    });
  });

  describe('findAssociationSettingsByAssociationId', () => {
    it('should return association settings when found', async () => {
      (mockAssociationRepository.findOneBy as jest.Mock).mockResolvedValue(mockAssociationSettings);

      const result = await repository.findAssociationSettingsByAssociationId('test-association-id');

      expect(result).toEqual(mockAssociationSettings);
      expect(mockAssociationRepository.findOneBy).toHaveBeenCalledWith({
        associationId: 'test-association-id',
      });
    });

    it('should return null when association settings not found', async () => {
      (mockAssociationRepository.findOneBy as jest.Mock).mockResolvedValue(null);

      const result = await repository.findAssociationSettingsByAssociationId('test-association-id');

      expect(result).toBeNull();
      expect(mockAssociationRepository.findOneBy).toHaveBeenCalledWith({
        associationId: 'test-association-id',
      });
    });
  });

  describe('createAssociationSettings', () => {
    it('should create association settings', async () => {
      (mockAssociationRepository.create as jest.Mock).mockReturnValue(mockAssociationSettings);
      (mockAssociationRepository.save as jest.Mock).mockResolvedValue(mockAssociationSettings);

      const result = await repository.createAssociationSettings(mockAssociationSettings);

      expect(result).toEqual(mockAssociationSettings);
      expect(mockAssociationRepository.create).toHaveBeenCalledWith(mockAssociationSettings);
      expect(mockAssociationRepository.save).toHaveBeenCalledWith(mockAssociationSettings);
    });
  });

  describe('upsertAssociationSettings', () => {
    it('should update existing association settings', async () => {
      const updateData = { profileVisibility: false };
      (mockAssociationRepository.findOneBy as jest.Mock).mockResolvedValue(mockAssociationSettings);
      (mockAssociationRepository.update as jest.Mock).mockResolvedValue({ affected: 1 });

      await repository.upsertAssociationSettings('test-association-id', updateData);

      expect(mockAssociationRepository.update).toHaveBeenCalledWith(
        { associationId: 'test-association-id' },
        updateData,
      );
    });

    it('should create new association settings if not exists', async () => {
      const updateData = { profileVisibility: false };
      (mockAssociationRepository.findOneBy as jest.Mock).mockResolvedValue(null);
      (mockAssociationRepository.save as jest.Mock).mockResolvedValue({
        ...mockAssociationSettings,
        ...updateData,
      });

      await repository.upsertAssociationSettings('test-association-id', updateData);

      expect(mockAssociationRepository.save).toHaveBeenCalledWith({
        associationId: 'test-association-id',
        ...updateData,
      });
    });
  });

  describe('deleteVolunteerSettings', () => {
    it('should delete volunteer settings', async () => {
      (mockVolunteerRepository.delete as jest.Mock).mockResolvedValue({ affected: 1 });

      await repository.deleteVolunteerSettings('test-user-id');

      expect(mockVolunteerRepository.delete).toHaveBeenCalledWith({ userId: 'test-user-id' });
    });

    it('should throw NotFoundException if not found', async () => {
      (mockVolunteerRepository.delete as jest.Mock).mockResolvedValue({ affected: 0 });

      await expect(repository.deleteVolunteerSettings('test-user-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('deleteAssociationSettings', () => {
    it('should delete association settings', async () => {
      (mockAssociationRepository.delete as jest.Mock).mockResolvedValue({ affected: 1 });

      await repository.deleteAssociationSettings('test-association-id');

      expect(mockAssociationRepository.delete).toHaveBeenCalledWith({
        associationId: 'test-association-id',
      });
    });

    it('should throw NotFoundException if not found', async () => {
      (mockAssociationRepository.delete as jest.Mock).mockResolvedValue({ affected: 0 });

      await expect(repository.deleteAssociationSettings('test-association-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
