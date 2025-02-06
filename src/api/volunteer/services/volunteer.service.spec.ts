// Mock FirebaseAdminService
import { VolunteerService } from './volunteer.service';
import { VolunteerRepository } from '../repository/volunteer.repository';
import { Test, TestingModule } from '@nestjs/testing';
import { FirebaseAdminService } from '../../../common/firebase/firebaseAdmin.service';
import { CreateVolunteerDto } from '../dto/create-volunteer.dto';

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

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [VolunteerService, { provide: VolunteerRepository, useValue: mockRepository }],
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
        'Email already exist',
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
        'Volunteer not found',
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

      await expect(volunteerService.remove('nonexistent')).rejects.toThrow('Volunteer not found');
    });

    it('should throw an error if volunteer not deleted', async () => {
      mockRepository.findById.mockResolvedValue(mockVolunteer);
      mockRepository.remove.mockResolvedValue({ deletedCount: 0 });

      await expect(volunteerService.remove('123')).rejects.toThrow('Volunteer not found');
    });
  });
});
