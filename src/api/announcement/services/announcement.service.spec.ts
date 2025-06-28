import { Test, TestingModule } from '@nestjs/testing';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { AnnouncementService } from './announcement.service';
import { AnnouncementRepository } from '../repositories/announcement.repository';
import { UserService } from '../../../common/services/user/user.service';
import { Logger } from '@nestjs/common';
import { Image } from '../../../common/type/usersInfo.type';
import { Announcement } from '../entities/announcement.entity';
import { CreateAnnouncementDto } from '../dto/create-announcement.dto';
import { AnnouncementStatus } from '../interfaces/announcement.interface';

describe('AnnouncementService', () => {
  let service: AnnouncementService;
  let repository: AnnouncementRepository;
  let cacheManager: any;

  const mockCacheManager = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnnouncementService,
        {
          provide: AnnouncementRepository,
          useValue: {
            findAll: jest.fn(),
            findById: jest.fn(),
            findByAssociationId: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            updateVolunteer: jest.fn(),
            delete: jest.fn(),
            deleteByAssociationId: jest.fn(),
            removeVolunteer: jest.fn(),
            removeVolunteerWaiting: jest.fn(),
            removeParticipant: jest.fn(),
            updateStatus: jest.fn(),
          },
        },
        {
          provide: UserService,
          useValue: {
            getUserImageProfile: jest.fn(),
          },
        },
        {
          provide: Logger,
          useValue: {
            log: jest.fn(),
            error: jest.fn(),
          },
        },
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheManager,
        },
      ],
    }).compile();

    service = module.get<AnnouncementService>(AnnouncementService);
    repository = module.get<AnnouncementRepository>(AnnouncementRepository);
    cacheManager = module.get(CACHE_MANAGER);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return cached announcements when cache hit', async () => {
      const cachedAnnouncements: Announcement[] = [
        {
          nameEvent: 'Test Event',
          description: 'Test description',
          datePublication: '2024-01-01',
          dateEvent: '2024-01-01',
          hoursEvent: '10:00',
          associationId: 'assoc-1',
          associationName: 'Test Assoc',
          maxParticipants: 10,
          status: AnnouncementStatus.ACTIVE,
          maxVolunteers: 5,
        },
      ];
      mockCacheManager.get.mockResolvedValue(cachedAnnouncements);

      const result = await service.findAll();

      expect(result).toEqual(cachedAnnouncements);
      expect(cacheManager.get).toHaveBeenCalledWith('allAnnouncements');
      expect(repository.findAll).not.toHaveBeenCalled();
    });

    it('should query database and cache result when cache miss', async () => {
      const announcements: Announcement[] = [
        {
          nameEvent: 'Test Event',
          description: 'Test description',
          datePublication: '2024-01-01',
          dateEvent: '2024-01-01',
          hoursEvent: '10:00',
          associationId: 'assoc-1',
          associationName: 'Test Assoc',
          maxParticipants: 10,
          status: AnnouncementStatus.ACTIVE,
          maxVolunteers: 5,
        },
      ];
      mockCacheManager.get.mockResolvedValue(null);
      jest.spyOn(repository, 'findAll').mockResolvedValue(announcements);

      const result = await service.findAll();

      expect(result).toEqual(announcements);
      expect(cacheManager.get).toHaveBeenCalledWith('allAnnouncements');
      expect(repository.findAll).toHaveBeenCalled();
      expect(cacheManager.set).toHaveBeenCalledWith('allAnnouncements', announcements);
    });
  });

  describe('findById', () => {
    it('should return cached announcement when cache hit', async () => {
      const cachedAnnouncement: Announcement = {
        nameEvent: 'Test Event',
        description: 'Test description',
        datePublication: '2024-01-01',
        dateEvent: '2024-01-01',
        hoursEvent: '10:00',
        associationId: 'assoc-1',
        associationName: 'Test Assoc',
        maxParticipants: 10,
        status: AnnouncementStatus.ACTIVE,
        maxVolunteers: 5,
      };
      mockCacheManager.get.mockResolvedValue(cachedAnnouncement);

      const result = await service.findById('1');

      expect(result).toEqual(cachedAnnouncement);
      expect(cacheManager.get).toHaveBeenCalledWith('announcement:1');
      expect(repository.findById).not.toHaveBeenCalled();
    });

    it('should query database and cache result when cache miss', async () => {
      const announcement: Announcement = {
        nameEvent: 'Test Event',
        description: 'Test description',
        datePublication: '2024-01-01',
        dateEvent: '2024-01-01',
        hoursEvent: '10:00',
        associationId: 'assoc-1',
        associationName: 'Test Assoc',
        maxParticipants: 10,
        status: AnnouncementStatus.ACTIVE,
        maxVolunteers: 5,
      };
      mockCacheManager.get.mockResolvedValue(null);
      jest.spyOn(repository, 'findById').mockResolvedValue(announcement);

      const result = await service.findById('1');

      expect(result).toEqual(announcement);
      expect(cacheManager.get).toHaveBeenCalledWith('announcement:1');
      expect(repository.findById).toHaveBeenCalledWith('1');
      expect(cacheManager.set).toHaveBeenCalledWith('announcement:1', announcement);
    });
  });

  describe('updateCover', () => {
    const announcementId = 'test-announcement-id';
    const mockFile = {
      buffer: Buffer.from('test-image-data'),
      mimetype: 'image/jpeg',
    } as Express.Multer.File;

    const mockImage: Image = {
      data: 'test-image-data',
      contentType: 'image/jpeg',
      uploadedAt: new Date(),
    };

    it('should update announcement cover successfully', async () => {
      // Mock the uploadProfileImage method
      jest.spyOn(service, 'uploadProfileImage').mockResolvedValue(mockImage);

      // Mock the repository update method
      jest.spyOn(repository, 'update').mockResolvedValue(undefined);

      const result = await service.updateCover(announcementId, mockFile);

      expect(result).toEqual(mockImage);
      expect(service.uploadProfileImage).toHaveBeenCalledWith(mockFile);
      expect(repository.update).toHaveBeenCalledWith(announcementId, {
        announcementImage: mockImage,
      });
      expect(cacheManager.del).toHaveBeenCalledWith('announcement:test-announcement-id');
      expect(cacheManager.del).toHaveBeenCalledWith('allAnnouncements');
    });

    it('should throw an error when no file is provided', async () => {
      await expect(service.updateCover(announcementId, null)).rejects.toThrow(
        'Erreur lors de la mise à jour de la photo de profil',
      );
    });

    it('should throw an error when repository update fails', async () => {
      // Mock the uploadProfileImage method
      jest.spyOn(service, 'uploadProfileImage').mockResolvedValue(mockImage);

      // Mock the repository update method to throw an error
      jest.spyOn(repository, 'update').mockRejectedValue(new Error('Database error'));

      await expect(service.updateCover(announcementId, mockFile)).rejects.toThrow(
        'Erreur lors de la mise à jour de la photo de profil',
      );
    });
  });

  describe('uploadProfileImage', () => {
    it('should return null when no file is provided', async () => {
      const result = await service.uploadProfileImage(null);
      expect(result).toBeNull();
    });

    it('should convert file to base64 image', async () => {
      const mockFile = {
        buffer: Buffer.from('test-image-data'),
        mimetype: 'image/jpeg',
      } as Express.Multer.File;

      const result = await service.uploadProfileImage(mockFile);

      expect(result).toBeDefined();
      expect(result.data).toBe('dGVzdC1pbWFnZS1kYXRh'); // Base64 encoded 'test-image-data'
      expect(result.contentType).toBe('image/jpeg');
      expect(result.uploadedAt).toBeDefined();
    });
  });

  describe('create', () => {
    it('should create announcement and invalidate cache', async () => {
      const createDto: CreateAnnouncementDto = {
        associationId: 'assoc-1',
        description: 'Test description',
        datePublication: '2024-01-01',
        dateEvent: '2024-01-01',
        hoursEvent: '10:00',
        nameEvent: 'Test Event',
        tags: ['test'],
        associationName: 'Test Assoc',
        locationAnnouncement: {
          address: '123 Test St',
          city: 'Test City',
          postalCode: '12345',
          country: 'Test Country',
        },
        maxParticipants: 10,
        status: AnnouncementStatus.ACTIVE,
        maxVolunteers: 5,
      };

      const mockImage: Image = {
        data: 'test-image-data',
        contentType: 'image/jpeg',
        uploadedAt: new Date(),
      };

      jest.spyOn(repository, 'create').mockResolvedValue('new-id');
      jest.spyOn(service['userService'], 'getUserImageProfile').mockResolvedValue(mockImage);

      const result = await service.create(createDto);

      expect(result).toBe('new-id');
      expect(cacheManager.del).toHaveBeenCalledWith('allAnnouncements');
    });
  });

  describe('update', () => {
    it('should update announcement and invalidate cache', async () => {
      const updateDto = { nameEvent: 'Updated Event' };
      jest.spyOn(repository, 'updateVolunteer').mockResolvedValue({});

      await service.update('test-id', updateDto);

      expect(cacheManager.del).toHaveBeenCalledWith('announcement:test-id');
      expect(cacheManager.del).toHaveBeenCalledWith('allAnnouncements');
    });
  });

  describe('delete', () => {
    it('should delete announcement and invalidate cache', async () => {
      jest.spyOn(repository, 'delete').mockResolvedValue(true);

      const result = await service.delete('test-id');

      expect(result).toBe(true);
      expect(cacheManager.del).toHaveBeenCalledWith('announcement:test-id');
      expect(cacheManager.del).toHaveBeenCalledWith('allAnnouncements');
    });
  });
});
