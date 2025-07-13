// Mock FirebaseAdminService
import { VolunteerService } from './volunteer.service';
import { VolunteerRepository } from '../repository/volunteer.repository';
import { Test, TestingModule } from '@nestjs/testing';
import { FirebaseAdminService } from '../../../common/firebase/firebaseAdmin.service';
import { CreateVolunteerDto } from '../dto/create-volunteer.dto';
import { BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { FavoritesAnnouncementService } from '../../favorites-announcement/services/favorites-announcement.service';
import { AnnouncementService } from '../../announcement/services/announcement.service';
import { AssociationService } from '../../association/services/association.service';

jest.mock('../../../common/firebase/firebaseAdmin.service', () => {
  const mockFirebaseAdmin = {
    getUserByEmail: jest.fn(),
  };

  return {
    FirebaseAdminService: {
      getInstance: jest.fn().mockReturnValue(mockFirebaseAdmin),
    },
  };
});

// Mock logger to avoid polluting test output
jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});

describe('VolunteerService', () => {
  let volunteerService: VolunteerService;
  let volunteerRepository: VolunteerRepository;
  let firebaseAdmin;

  const mockVolunteer = {
    volunteerId: '123',
    city: 'Paris',
    country: 'France',
    postalCode: '75000',
    birthDate: '01/01/2000',
    bio: 'I am a volunteer',
  };

  const mockRepository = {
    create: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const favoritesAnnouncementServiceMock = {
    removeByVolunteerId: jest.fn().mockResolvedValue({ deletedCount: 1 }),
  };
  const announcementServiceMock = {
    removeVolunteerEverywhere: jest.fn().mockResolvedValue(1),
    removeParticipantEverywhere: jest.fn().mockResolvedValue(1),
  };
  const associationServiceMock = {
    removeVolunteerFollowingEverywhere: jest.fn().mockResolvedValue(1),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VolunteerService,
        { provide: VolunteerRepository, useValue: mockRepository },
        {
          provide: FavoritesAnnouncementService,
          useValue: favoritesAnnouncementServiceMock,
        },
        {
          provide: AnnouncementService,
          useValue: announcementServiceMock,
        },
        {
          provide: AssociationService,
          useValue: associationServiceMock,
        },
      ],
    }).compile();

    volunteerService = module.get<VolunteerService>(VolunteerService);
    volunteerRepository = module.get<VolunteerRepository>(VolunteerRepository);
    firebaseAdmin = FirebaseAdminService.getInstance();
  });

  it('should be defined', () => {
    expect(volunteerService).toBeDefined();
  });

  describe('create', () => {
    it('should create a volunteer', async () => {
      const createVolunteerDto: CreateVolunteerDto = {
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        phone: '1234567890',
        city: 'Paris',
        country: 'France',
        postalCode: '75000',
        birthDate: '01/01/2000',
        bio: 'I am a volunteer',
      };

      // Mock Firebase response
      firebaseAdmin.getUserByEmail.mockResolvedValueOnce({
        uid: 'mockFirebaseUid123',
        email: 'test@example.com',
      });

      firebaseAdmin.getUserByEmail.mockResolvedValue({ uid: '123' });
      mockRepository.findById.mockResolvedValue(null);
      mockRepository.create.mockResolvedValue(mockVolunteer);

      const result = await volunteerService.create(createVolunteerDto);
      expect(result).toEqual(mockVolunteer);
    });

    it('should throw an error if email already exists', async () => {
      const createVolunteerDto: CreateVolunteerDto = {
        email: 'test@example.com',
        city: 'Paris',
        firstName: 'Test',
        lastName: 'User',
        phone: '1234567890',
        country: 'France',
        postalCode: '75000',
        birthDate: '01/01/2000',
        bio: 'I am a volunteer',
      };

      // Mock Firebase response
      firebaseAdmin.getUserByEmail.mockResolvedValueOnce({
        uid: 'mockFirebaseUid123',
        email: 'test@example.com',
      });
      mockRepository.findById.mockResolvedValue(mockVolunteer);

      await expect(volunteerService.create(createVolunteerDto)).rejects.toThrow(
        BadRequestException,
      );
      expect(firebaseAdmin.getUserByEmail).toHaveBeenCalledTimes(1);
      expect(volunteerRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return all volunteers', async () => {
      mockRepository.findAll.mockResolvedValue([mockVolunteer]);
      const result = await volunteerService.findAll();
      expect(result).toEqual([mockVolunteer]);
    });
  });
  describe('findOne', () => {
    it('should return a volunteer', async () => {
      mockRepository.findById.mockResolvedValue(mockVolunteer);
      const result = await volunteerService.findOne('123');
      expect(result).toEqual(mockVolunteer);
    });
  });
  describe('update', () => {
    it('should update a volunteer', async () => {
      const updateVolunteerDto = {
        city: 'Paris',
        country: 'France',
        postalCode: '75000',
        birthDate: '01/01/2000',
        bio: 'I am a volunteer',
      };

      mockRepository.findById.mockResolvedValue(mockVolunteer);
      mockRepository.update.mockResolvedValue(mockVolunteer);

      const result = await volunteerService.update('123', updateVolunteerDto);
      expect(result).toEqual(mockVolunteer);
    });

    it('should throw an error if volunteer not found', async () => {
      mockRepository.findById.mockResolvedValue(null);
      await expect(volunteerService.update('nonexistent', { bio: 'Updated Bio' })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should remove a volunteer', async () => {
      mockRepository.findById.mockResolvedValue(mockVolunteer);
      mockRepository.remove.mockResolvedValue({ deletedCount: 1 });

      const result = await volunteerService.remove('123');
      expect(result).toEqual({ volunteerId: '123' });
    });

    it('should throw an error if volunteer not found', async () => {
      mockRepository.findById.mockResolvedValue(null);
      await expect(volunteerService.remove('nonexistent')).rejects.toThrow(NotFoundException);
    });

    it('should throw an error if volunteer not deleted', async () => {
      mockRepository.findById.mockResolvedValue(mockVolunteer);
      mockRepository.remove.mockResolvedValue({ deletedCount: 0 });

      // Maintenant que le service vérifie le deletedCount, il doit lever une exception
      await expect(volunteerService.remove('123')).rejects.toThrow(NotFoundException);
    });
  });
});
