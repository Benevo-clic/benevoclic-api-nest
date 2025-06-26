import { Test, TestingModule } from '@nestjs/testing';
import { FavoritesAnnouncementService } from './favorites-announcement.service';
import { FavoritesAnnouncementRepository } from '../repository/favorites-announcement.repository';
import { FavoritesAnnouncement } from '../entities/favorites-announcement.entity';
import { AnnouncementService } from '../../announcement/services/announcement.service';

describe('FavoritesAnnouncementService', () => {
  let service: FavoritesAnnouncementService;
  let repository: FavoritesAnnouncementRepository;
  let announcementService: AnnouncementService;

  const mockFavoritesAnnouncementRepository = {
    create: jest.fn(),
    findAll: jest.fn(),
    removeByVolunteerIdAndAnnouncementId: jest.fn(),
    removeByVolunteerId: jest.fn(),
    removeByAnnouncementId: jest.fn(),
    findAllByVolunteerId: jest.fn(),
    findAllByAnnouncementId: jest.fn(),
    findByVolunteerIdAndAnnouncementId: jest.fn(),
  };

  const mockAnnouncementService = {
    findById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FavoritesAnnouncementService,
        {
          provide: FavoritesAnnouncementRepository,
          useValue: mockFavoritesAnnouncementRepository,
        },
        {
          provide: AnnouncementService,
          useValue: mockAnnouncementService,
        },
      ],
    }).compile();

    service = module.get<FavoritesAnnouncementService>(FavoritesAnnouncementService);
    repository = module.get<FavoritesAnnouncementRepository>(FavoritesAnnouncementRepository);
    announcementService = module.get<AnnouncementService>(AnnouncementService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const mockFavoritesAnnouncement: FavoritesAnnouncement = {
      volunteerId: 'volunteer-123',
      announcementId: 'announcement-456',
    };

    it('should create a new favorite announcement when it does not exist', async () => {
      // Arrange
      mockFavoritesAnnouncementRepository.findByVolunteerIdAndAnnouncementId.mockResolvedValue(
        null,
      );
      mockFavoritesAnnouncementRepository.create.mockResolvedValue(mockFavoritesAnnouncement);

      // Act
      const result = await service.create(mockFavoritesAnnouncement);

      // Assert
      expect(repository.findByVolunteerIdAndAnnouncementId).toHaveBeenCalledWith(
        mockFavoritesAnnouncement.volunteerId,
        mockFavoritesAnnouncement.announcementId,
      );
      expect(repository.create).toHaveBeenCalledWith(mockFavoritesAnnouncement);
      expect(result).toEqual(mockFavoritesAnnouncement);
    });

    it('should throw an error when favorite announcement already exists', async () => {
      // Arrange
      mockFavoritesAnnouncementRepository.findByVolunteerIdAndAnnouncementId.mockResolvedValue(
        mockFavoritesAnnouncement,
      );

      // Act & Assert
      await expect(service.create(mockFavoritesAnnouncement)).rejects.toThrow(
        'Favorite announcement already exists',
      );
      expect(repository.findByVolunteerIdAndAnnouncementId).toHaveBeenCalledWith(
        mockFavoritesAnnouncement.volunteerId,
        mockFavoritesAnnouncement.announcementId,
      );
      expect(repository.create).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return all favorite announcements', async () => {
      // Arrange
      const mockFavorites = [
        { volunteerId: 'volunteer-1', announcementId: 'announcement-1' },
        { volunteerId: 'volunteer-2', announcementId: 'announcement-2' },
      ];
      mockFavoritesAnnouncementRepository.findAll.mockResolvedValue(mockFavorites);

      // Act
      const result = await service.findAll();

      // Assert
      expect(repository.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockFavorites);
    });
  });

  describe('removeByVolunteerIdAndAnnouncementId', () => {
    it('should remove favorite announcement by volunteer ID and announcement ID', async () => {
      // Arrange
      const volunteerId = 'volunteer-123';
      const announcementId = 'announcement-456';
      const mockResult = { deletedCount: 1 };
      mockFavoritesAnnouncementRepository.removeByVolunteerIdAndAnnouncementId.mockResolvedValue(
        mockResult,
      );

      // Act
      const result = await service.removeByVolunteerIdAndAnnouncementId(
        volunteerId,
        announcementId,
      );

      // Assert
      expect(repository.removeByVolunteerIdAndAnnouncementId).toHaveBeenCalledWith(
        volunteerId,
        announcementId,
      );
      expect(result).toEqual(mockResult);
    });
  });

  describe('removeByVolunteerId', () => {
    it('should remove all favorite announcements by volunteer ID', async () => {
      // Arrange
      const volunteerId = 'volunteer-123';
      const mockResult = { deletedCount: 3 };
      mockFavoritesAnnouncementRepository.removeByVolunteerId.mockResolvedValue(mockResult);

      // Act
      const result = await service.removeByVolunteerId(volunteerId);

      // Assert
      expect(repository.removeByVolunteerId).toHaveBeenCalledWith(volunteerId);
      expect(result).toEqual(mockResult);
    });
  });

  describe('removeByAnnouncementId', () => {
    it('should remove all favorite announcements by announcement ID', async () => {
      // Arrange
      const announcementId = 'announcement-456';
      const mockResult = { deletedCount: 2 };
      mockFavoritesAnnouncementRepository.removeByAnnouncementId.mockResolvedValue(mockResult);

      // Act
      const result = await service.removeByAnnouncementId(announcementId);

      // Assert
      expect(repository.removeByAnnouncementId).toHaveBeenCalledWith(announcementId);
      expect(result).toEqual(mockResult);
    });
  });

  describe('findAllByVolunteerId', () => {
    it('should return all favorite announcements for a specific volunteer', async () => {
      // Arrange
      const volunteerId = 'volunteer-123';
      const mockFavorites = [
        { volunteerId: 'volunteer-123', announcementId: 'announcement-1' },
        { volunteerId: 'volunteer-123', announcementId: 'announcement-2' },
      ];
      mockFavoritesAnnouncementRepository.findAllByVolunteerId.mockResolvedValue(mockFavorites);

      // Act
      const result = await service.findAllByVolunteerId(volunteerId);

      // Assert
      expect(repository.findAllByVolunteerId).toHaveBeenCalledWith(volunteerId);
      expect(result).toEqual(mockFavorites);
    });
  });

  describe('findAllByAnnouncementId', () => {
    it('should return all favorite announcements for a specific announcement', async () => {
      // Arrange
      const announcementId = 'announcement-456';
      const mockFavorites = [
        { volunteerId: 'volunteer-1', announcementId: 'announcement-456' },
        { volunteerId: 'volunteer-2', announcementId: 'announcement-456' },
      ];
      mockFavoritesAnnouncementRepository.findAllByAnnouncementId.mockResolvedValue(mockFavorites);

      // Act
      const result = await service.findAllByAnnouncementId(announcementId);

      // Assert
      expect(repository.findAllByAnnouncementId).toHaveBeenCalledWith(announcementId);
      expect(result).toEqual(mockFavorites);
    });
  });

  describe('findByVolunteerIdAndAnnouncementId', () => {
    it('should return a specific favorite announcement', async () => {
      // Arrange
      const volunteerId = 'volunteer-123';
      const announcementId = 'announcement-456';
      const mockFavorite = { volunteerId: 'volunteer-123', announcementId: 'announcement-456' };
      mockFavoritesAnnouncementRepository.findByVolunteerIdAndAnnouncementId.mockResolvedValue(
        mockFavorite,
      );

      // Act
      const result = await service.findByVolunteerIdAndAnnouncementId(volunteerId, announcementId);

      // Assert
      expect(repository.findByVolunteerIdAndAnnouncementId).toHaveBeenCalledWith(
        volunteerId,
        announcementId,
      );
      expect(result).toEqual(mockFavorite);
    });

    it('should return null when favorite announcement does not exist', async () => {
      // Arrange
      const volunteerId = 'volunteer-123';
      const announcementId = 'announcement-456';
      mockFavoritesAnnouncementRepository.findByVolunteerIdAndAnnouncementId.mockResolvedValue(
        null,
      );

      // Act
      const result = await service.findByVolunteerIdAndAnnouncementId(volunteerId, announcementId);

      // Assert
      expect(repository.findByVolunteerIdAndAnnouncementId).toHaveBeenCalledWith(
        volunteerId,
        announcementId,
      );
      expect(result).toBeNull();
    });
  });

  describe('findByVolunteerIdAllFavoritesAnnouncement', () => {
    it('should return all favorite announcements with their associated announcement data for a volunteer', async () => {
      // Arrange
      const volunteerId = 'volunteer-123';
      const mockFavorites = [
        { volunteerId: 'volunteer-123', announcementId: 'announcement-1' },
        { volunteerId: 'volunteer-123', announcementId: 'announcement-2' },
      ];
      const mockAnnouncement1 = {
        id: 'announcement-1',
        nameEvent: 'Event 1',
        description: 'Description 1',
        associationId: 'association-1',
      };
      const mockAnnouncement2 = {
        id: 'announcement-2',
        nameEvent: 'Event 2',
        description: 'Description 2',
        associationId: 'association-2',
      };

      mockFavoritesAnnouncementRepository.findAllByVolunteerId.mockResolvedValue(mockFavorites);
      mockAnnouncementService.findById
        .mockResolvedValueOnce(mockAnnouncement1)
        .mockResolvedValueOnce(mockAnnouncement2);

      // Act
      const result = await service.findByVolunteerIdAllFavoritesAnnouncement(volunteerId);

      // Assert
      expect(repository.findAllByVolunteerId).toHaveBeenCalledWith(volunteerId);
      expect(announcementService.findById).toHaveBeenCalledWith('announcement-1');
      expect(announcementService.findById).toHaveBeenCalledWith('announcement-2');
      expect(result).toEqual([mockAnnouncement1, mockAnnouncement2]);
    });

    it('should return empty array when volunteer has no favorite announcements', async () => {
      // Arrange
      const volunteerId = 'volunteer-123';
      mockFavoritesAnnouncementRepository.findAllByVolunteerId.mockResolvedValue([]);

      // Act
      const result = await service.findByVolunteerIdAllFavoritesAnnouncement(volunteerId);

      // Assert
      expect(repository.findAllByVolunteerId).toHaveBeenCalledWith(volunteerId);
      expect(announcementService.findById).not.toHaveBeenCalled();
      expect(result).toEqual([]);
    });

    it('should handle case when announcement is not found', async () => {
      // Arrange
      const volunteerId = 'volunteer-123';
      const mockFavorites = [{ volunteerId: 'volunteer-123', announcementId: 'announcement-1' }];
      const mockAnnouncement1 = {
        id: 'announcement-1',
        nameEvent: 'Event 1',
        description: 'Description 1',
        associationId: 'association-1',
      };

      mockFavoritesAnnouncementRepository.findAllByVolunteerId.mockResolvedValue(mockFavorites);
      mockAnnouncementService.findById.mockResolvedValue(mockAnnouncement1);

      // Act
      const result = await service.findByVolunteerIdAllFavoritesAnnouncement(volunteerId);

      // Assert
      expect(repository.findAllByVolunteerId).toHaveBeenCalledWith(volunteerId);
      expect(announcementService.findById).toHaveBeenCalledWith('announcement-1');
      expect(result).toEqual([mockAnnouncement1]);
    });
  });
});
