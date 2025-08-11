import { Test, TestingModule } from '@nestjs/testing';
import { SettingsService } from './settings.service';
import { SettingsRepository } from '../repository/settings.repository';
import { UpdateVolunteerSettingsDto } from '../dto/update-volunteer-settings.dto';
import { UpdateAssociationSettingsDto } from '../dto/update-association-settings.dto';
import { VolunteerSettings } from '../entities/volunteer-settings.entity';
import { AssociationSettings } from '../entities/association-settings.entity';

describe('SettingsService', () => {
  let service: SettingsService;
  let repository: SettingsRepository;

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
    eventApproval: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SettingsService,
        {
          provide: SettingsRepository,
          useValue: {
            findVolunteerSettingsByUserId: jest.fn(),
            createVolunteerSettings: jest.fn(),
            upsertVolunteerSettings: jest.fn(),
            findAssociationSettingsByAssociationId: jest.fn(),
            createAssociationSettings: jest.fn(),
            upsertAssociationSettings: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<SettingsService>(SettingsService);
    repository = module.get<SettingsRepository>(SettingsRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getOrCreateVolunteerSettings', () => {
    it('should return existing volunteer settings', async () => {
      jest
        .spyOn(repository, 'findVolunteerSettingsByUserId')
        .mockResolvedValue(mockVolunteerSettings);

      const result = await service.getOrCreateVolunteerSettings('test-user-id');

      expect(result).toEqual(mockVolunteerSettings);
      expect(repository.findVolunteerSettingsByUserId).toHaveBeenCalledWith('test-user-id');
      expect(repository.createVolunteerSettings).not.toHaveBeenCalled();
    });

    it('should create new volunteer settings if none exist', async () => {
      jest.spyOn(repository, 'findVolunteerSettingsByUserId').mockResolvedValue(null);
      jest.spyOn(repository, 'createVolunteerSettings').mockResolvedValue(mockVolunteerSettings);

      const result = await service.getOrCreateVolunteerSettings('test-user-id');

      expect(result).toEqual(mockVolunteerSettings);
      expect(repository.findVolunteerSettingsByUserId).toHaveBeenCalledWith('test-user-id');
      expect(repository.createVolunteerSettings).toHaveBeenCalledWith({
        userId: 'test-user-id',
        profileVisibility: true,
        locationSharing: false,
        activitySharing: true,
        twoFactor: false,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
    });
  });

  describe('updateVolunteerSettings', () => {
    it('should update volunteer settings', async () => {
      const updateDto: UpdateVolunteerSettingsDto = {
        profileVisibility: false,
        locationSharing: true,
      };

      jest.spyOn(repository, 'upsertVolunteerSettings').mockResolvedValue({
        ...mockVolunteerSettings,
        ...updateDto,
      });

      const result = await service.updateVolunteerSettings('test-user-id', updateDto);

      expect(result).toEqual({
        ...mockVolunteerSettings,
        ...updateDto,
      });
      expect(repository.upsertVolunteerSettings).toHaveBeenCalledWith('test-user-id', updateDto);
    });
  });

  describe('getOrCreateAssociationSettings', () => {
    it('should return existing association settings', async () => {
      jest
        .spyOn(repository, 'findAssociationSettingsByAssociationId')
        .mockResolvedValue(mockAssociationSettings);

      const result = await service.getOrCreateAssociationSettings('test-association-id');

      expect(result).toEqual(mockAssociationSettings);
      expect(repository.findAssociationSettingsByAssociationId).toHaveBeenCalledWith(
        'test-association-id',
      );
      expect(repository.createAssociationSettings).not.toHaveBeenCalled();
    });

    it('should create new association settings if none exist', async () => {
      jest.spyOn(repository, 'findAssociationSettingsByAssociationId').mockResolvedValue(null);
      jest
        .spyOn(repository, 'createAssociationSettings')
        .mockResolvedValue(mockAssociationSettings);

      const result = await service.getOrCreateAssociationSettings('test-association-id');

      expect(result).toEqual(mockAssociationSettings);
      expect(repository.findAssociationSettingsByAssociationId).toHaveBeenCalledWith(
        'test-association-id',
      );
      expect(repository.createAssociationSettings).toHaveBeenCalledWith({
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
        eventApproval: true,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
    });
  });

  describe('updateAssociationSettings', () => {
    it('should update association settings', async () => {
      const updateDto: UpdateAssociationSettingsDto = {
        profileVisibility: false,
        contactInfoVisibility: true,
      };

      jest.spyOn(repository, 'upsertAssociationSettings').mockResolvedValue({
        ...mockAssociationSettings,
        ...updateDto,
      });

      const result = await service.updateAssociationSettings('test-association-id', updateDto);

      expect(result).toEqual({
        ...mockAssociationSettings,
        ...updateDto,
      });
      expect(repository.upsertAssociationSettings).toHaveBeenCalledWith(
        'test-association-id',
        updateDto,
      );
    });
  });
});
