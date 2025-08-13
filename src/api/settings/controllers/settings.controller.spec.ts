import { Test, TestingModule } from '@nestjs/testing';
import { SettingsController } from './settings.controller';
import { SettingsService } from '../services/settings.service';
import { UpdateVolunteerSettingsDto } from '../dto/update-volunteer-settings.dto';
import { UpdateAssociationSettingsDto } from '../dto/update-association-settings.dto';
import { VolunteerSettings } from '../entities/volunteer-settings.entity';
import { AssociationSettings } from '../entities/association-settings.entity';
import { ObjectId } from 'mongodb';
import { UserRole } from '../../../common/enums/roles.enum';

describe('SettingsController', () => {
  let controller: SettingsController;
  let service: SettingsService;

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

  const mockRequest = {
    user: {
      uid: 'test-user-id',
      role: UserRole.VOLUNTEER,
    },
  };

  const mockAssociationRequest = {
    user: {
      uid: 'test-association-id',
      role: UserRole.ASSOCIATION,
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SettingsController],
      providers: [
        {
          provide: SettingsService,
          useValue: {
            getOrCreateVolunteerSettings: jest.fn(),
            updateVolunteerSettings: jest.fn(),
            getOrCreateAssociationSettings: jest.fn(),
            updateAssociationSettings: jest.fn(),
          },
        },
        {
          provide: 'Logger',
          useValue: {
            log: jest.fn(),
            error: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<SettingsController>(SettingsController);
    service = module.get<SettingsService>(SettingsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getVolunteerSettings', () => {
    it('should return volunteer settings', async () => {
      jest.spyOn(service, 'getOrCreateVolunteerSettings').mockResolvedValue(mockVolunteerSettings);

      const result = await controller.getVolunteerSettings(mockRequest as any);

      expect(result).toEqual(mockVolunteerSettings);
      expect(service.getOrCreateVolunteerSettings).toHaveBeenCalledWith('test-user-id');
    });

    it('should handle errors', async () => {
      jest
        .spyOn(service, 'getOrCreateVolunteerSettings')
        .mockRejectedValue(new Error('Test error'));

      await expect(controller.getVolunteerSettings(mockRequest as any)).rejects.toThrow(
        'Test error',
      );
    });
  });

  describe('updateVolunteerSettings', () => {
    it('should handle errors', async () => {
      const updateDto: UpdateVolunteerSettingsDto = {
        profileVisibility: false,
      };

      jest.spyOn(service, 'updateVolunteerSettings').mockRejectedValue(new Error('Test error'));

      await expect(
        controller.updateVolunteerSettings(mockRequest as any, updateDto),
      ).rejects.toThrow('Test error');
    });
  });

  describe('getAssociationSettings', () => {
    it('should return association settings', async () => {
      jest
        .spyOn(service, 'getOrCreateAssociationSettings')
        .mockResolvedValue(mockAssociationSettings);

      const result = await controller.getAssociationSettings(mockAssociationRequest as any);

      expect(result).toEqual(mockAssociationSettings);
      expect(service.getOrCreateAssociationSettings).toHaveBeenCalledWith('test-association-id');
    });

    it('should handle errors', async () => {
      jest
        .spyOn(service, 'getOrCreateAssociationSettings')
        .mockRejectedValue(new Error('Test error'));

      await expect(
        controller.getAssociationSettings(mockAssociationRequest as any),
      ).rejects.toThrow('Test error');
    });
  });

  describe('updateAssociationSettings', () => {
    it('should handle errors', async () => {
      const updateDto: UpdateAssociationSettingsDto = {
        profileVisibility: false,
      };

      jest.spyOn(service, 'updateAssociationSettings').mockRejectedValue(new Error('Test error'));

      await expect(
        controller.updateAssociationSettings(mockAssociationRequest as any, updateDto),
      ).rejects.toThrow('Test error');
    });
  });
});
