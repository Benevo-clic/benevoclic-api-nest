import { Test, TestingModule } from '@nestjs/testing';
import { FavoritesAnnouncementController } from './favorites-announcement.controller';
import { FavoritesAnnouncementService } from '../services/favorites-announcement.service';
import { CreateFavoritesAnnouncementDto } from '../dto/create-favorites-announcement.dto';

describe('FavoritesAnnouncementController', () => {
  let controller: FavoritesAnnouncementController;
  let service: FavoritesAnnouncementService;

  const mockFavoritesAnnouncementService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findAllByVolunteerId: jest.fn(),
    findAllByAnnouncementId: jest.fn(),
    findByVolunteerIdAndAnnouncementId: jest.fn(),
    findByVolunteerIdAllFavoritesAnnouncement: jest.fn(),
    removeByVolunteerIdAndAnnouncementId: jest.fn(),
    removeByVolunteerId: jest.fn(),
    removeByAnnouncementId: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FavoritesAnnouncementController],
      providers: [
        {
          provide: FavoritesAnnouncementService,
          useValue: mockFavoritesAnnouncementService,
        },
      ],
    }).compile();

    controller = module.get<FavoritesAnnouncementController>(FavoritesAnnouncementController);
    service = module.get<FavoritesAnnouncementService>(FavoritesAnnouncementService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new favorite announcement', async () => {
      const createDto: CreateFavoritesAnnouncementDto = {
        volunteerId: 'volunteer-123',
        announcementId: 'announcement-456',
      };
      const expectedResult = { ...createDto, id: 'favorite-789' };
      mockFavoritesAnnouncementService.create.mockResolvedValue(expectedResult);

      const result = await controller.create(createDto);

      expect(service.create).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(expectedResult);
    });

    it('should handle error during creation', async () => {
      const createDto: CreateFavoritesAnnouncementDto = {
        volunteerId: 'volunteer-123',
        announcementId: 'announcement-456',
      };
      mockFavoritesAnnouncementService.create.mockReturnValue(null);

      const result = await controller.create(createDto);

      expect(service.create).toHaveBeenCalledWith(createDto);
      expect(result).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should return all favorite announcements', async () => {
      const expectedResult = [
        { volunteerId: 'volunteer-1', announcementId: 'announcement-1' },
        { volunteerId: 'volunteer-2', announcementId: 'announcement-2' },
      ];
      mockFavoritesAnnouncementService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findAllByVolunteerId', () => {
    it('should return all favorite announcements for a specific volunteer', async () => {
      const volunteerId = 'volunteer-123';
      const expectedResult = [
        { volunteerId: 'volunteer-123', announcementId: 'announcement-1' },
        { volunteerId: 'volunteer-123', announcementId: 'announcement-2' },
      ];
      mockFavoritesAnnouncementService.findAllByVolunteerId.mockResolvedValue(expectedResult);

      const result = await controller.findAllByVolunteerId(volunteerId);

      expect(service.findAllByVolunteerId).toHaveBeenCalledWith(volunteerId);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findAllByAnnouncementId', () => {
    it('should return all favorite announcements for a specific announcement', async () => {
      const announcementId = 'announcement-456';
      const expectedResult = [
        { volunteerId: 'volunteer-1', announcementId: 'announcement-456' },
        { volunteerId: 'volunteer-2', announcementId: 'announcement-456' },
      ];
      mockFavoritesAnnouncementService.findAllByAnnouncementId.mockResolvedValue(expectedResult);

      const result = await controller.findAllByAnnouncementId(announcementId);

      expect(service.findAllByAnnouncementId).toHaveBeenCalledWith(announcementId);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findByVolunteerIdAndAnnouncementId', () => {
    it('should return a specific favorite announcement', async () => {
      const volunteerId = 'volunteer-123';
      const announcementId = 'announcement-456';
      const expectedResult = { volunteerId: 'volunteer-123', announcementId: 'announcement-456' };
      mockFavoritesAnnouncementService.findByVolunteerIdAndAnnouncementId.mockResolvedValue(
        expectedResult,
      );

      const result = await controller.findByVolunteerIdAndAnnouncementId(
        volunteerId,
        announcementId,
      );

      expect(service.findByVolunteerIdAndAnnouncementId).toHaveBeenCalledWith(
        volunteerId,
        announcementId,
      );
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findByVolunteerIdAllFavoritesAnnouncement', () => {
    it('should return all favorite announcements with announcement data for a volunteer', async () => {
      const volunteerId = 'volunteer-123';
      const expectedResult = [
        {
          id: 'announcement-1',
          nameEvent: 'Event 1',
          description: 'Description 1',
        },
        {
          id: 'announcement-2',
          nameEvent: 'Event 2',
          description: 'Description 2',
        },
      ];
      mockFavoritesAnnouncementService.findByVolunteerIdAllFavoritesAnnouncement.mockResolvedValue(
        expectedResult,
      );

      const result = await controller.findByVolunteerIdAllFavoritesAnnouncement(volunteerId);

      expect(service.findByVolunteerIdAllFavoritesAnnouncement).toHaveBeenCalledWith(volunteerId);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('removeByVolunteerIdAndAnnouncementId', () => {
    it('should remove a specific favorite announcement', async () => {
      const volunteerId = 'volunteer-123';
      const announcementId = 'announcement-456';
      const expectedResult = { deletedCount: 1 };
      mockFavoritesAnnouncementService.removeByVolunteerIdAndAnnouncementId.mockResolvedValue(
        expectedResult,
      );

      const result = await controller.removeByVolunteerIdAndAnnouncementId(
        volunteerId,
        announcementId,
      );

      expect(service.removeByVolunteerIdAndAnnouncementId).toHaveBeenCalledWith(
        volunteerId,
        announcementId,
      );
      expect(result).toEqual(expectedResult);
    });

    it('should handle error during removal', async () => {
      const volunteerId = 'volunteer-123';
      const announcementId = 'announcement-456';
      mockFavoritesAnnouncementService.removeByVolunteerIdAndAnnouncementId.mockReturnValue(null);

      const result = await controller.removeByVolunteerIdAndAnnouncementId(
        volunteerId,
        announcementId,
      );

      expect(service.removeByVolunteerIdAndAnnouncementId).toHaveBeenCalledWith(
        volunteerId,
        announcementId,
      );
      expect(result).toBeNull();
    });
  });

  describe('removeAllByVolunteerId', () => {
    it('should remove all favorite announcements for a volunteer', async () => {
      const volunteerId = 'volunteer-123';
      const expectedResult = { deletedCount: 3 };
      mockFavoritesAnnouncementService.removeByVolunteerId.mockResolvedValue(expectedResult);

      const result = await controller.removeAllByVolunteerId(volunteerId);

      expect(service.removeByVolunteerId).toHaveBeenCalledWith(volunteerId);
      expect(result).toEqual(expectedResult);
    });

    it('should handle error during removal', async () => {
      const volunteerId = 'volunteer-123';
      mockFavoritesAnnouncementService.removeByVolunteerId.mockReturnValue(null);

      const result = await controller.removeAllByVolunteerId(volunteerId);

      expect(service.removeByVolunteerId).toHaveBeenCalledWith(volunteerId);
      expect(result).toBeNull();
    });
  });

  describe('removeAllByAnnouncementId', () => {
    it('should remove all favorite announcements for an announcement', async () => {
      const announcementId = 'announcement-456';
      const expectedResult = { deletedCount: 2 };
      mockFavoritesAnnouncementService.removeByAnnouncementId.mockResolvedValue(expectedResult);

      const result = await controller.removeAllByAnnouncementId(announcementId);

      expect(service.removeByAnnouncementId).toHaveBeenCalledWith(announcementId);
      expect(result).toEqual(expectedResult);
    });

    it('should handle error during removal', async () => {
      const announcementId = 'announcement-456';
      mockFavoritesAnnouncementService.removeByAnnouncementId.mockReturnValue(null);

      const result = await controller.removeAllByAnnouncementId(announcementId);

      expect(service.removeByAnnouncementId).toHaveBeenCalledWith(announcementId);
      expect(result).toBeNull();
    });
  });
});
