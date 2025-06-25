import { Test, TestingModule } from '@nestjs/testing';
import { FavoritesAnnouncementRepository } from './favorites-announcement.repository';
import { MongoClient } from 'mongodb';
import { MONGODB_CONNECTION } from '../../../database/mongodb.provider';
import { DatabaseCollection } from '../../../common/enums/database.collection';
import { FavoritesAnnouncement } from '../entities/favorites-announcement.entity';

describe('FavoritesAnnouncementRepository', () => {
  let repository: FavoritesAnnouncementRepository;
  let mockMongoClient: jest.Mocked<MongoClient>;
  let mockCollection: jest.Mocked<any>;

  const mockFavoritesAnnouncement: FavoritesAnnouncement = {
    volunteerId: 'volunteer-123',
    announcementId: 'announcement-456',
  };

  beforeEach(async () => {
    // Mock collection methods
    mockCollection = {
      findOne: jest.fn(),
      insertOne: jest.fn(),
      find: jest.fn(),
      deleteOne: jest.fn(),
      deleteMany: jest.fn(),
      toArray: jest.fn(),
    };

    // Mock MongoDB client
    mockMongoClient = {
      db: jest.fn().mockReturnValue({
        collection: jest.fn().mockReturnValue(mockCollection),
      }),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FavoritesAnnouncementRepository,
        {
          provide: MONGODB_CONNECTION,
          useValue: mockMongoClient,
        },
      ],
    }).compile();

    repository = module.get<FavoritesAnnouncementRepository>(FavoritesAnnouncementRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('findByVolunteerIdAndAnnouncementId', () => {
    it('should find a favorite announcement by volunteer ID and announcement ID', async () => {
      // Arrange
      const volunteerId = 'volunteer-123';
      const announcementId = 'announcement-456';
      const expectedResult = { ...mockFavoritesAnnouncement };
      mockCollection.findOne.mockResolvedValue(expectedResult);

      // Act
      const result = await repository.findByVolunteerIdAndAnnouncementId(
        volunteerId,
        announcementId,
      );

      // Assert
      expect(mockMongoClient.db).toHaveBeenCalled();
      expect(mockMongoClient.db().collection).toHaveBeenCalledWith(DatabaseCollection.FAVORITES);
      expect(mockCollection.findOne).toHaveBeenCalledWith(
        {
          volunteerId: { $eq: volunteerId },
          announcementId: { $eq: announcementId },
        },
        { projection: { _id: 0, __v: 0 } },
      );
      expect(result).toEqual(expectedResult);
    });

    it('should return null when favorite announcement is not found', async () => {
      // Arrange
      const volunteerId = 'volunteer-123';
      const announcementId = 'announcement-456';
      mockCollection.findOne.mockResolvedValue(null);

      // Act
      const result = await repository.findByVolunteerIdAndAnnouncementId(
        volunteerId,
        announcementId,
      );

      // Assert
      expect(mockCollection.findOne).toHaveBeenCalledWith(
        {
          volunteerId: { $eq: volunteerId },
          announcementId: { $eq: announcementId },
        },
        { projection: { _id: 0, __v: 0 } },
      );
      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create a new favorite announcement successfully', async () => {
      // Arrange
      const mockInsertResult = {
        insertedId: 'new-id-123',
        acknowledged: true,
      };
      mockCollection.insertOne.mockResolvedValue(mockInsertResult);

      // Act
      const result = await repository.create(mockFavoritesAnnouncement);

      // Assert
      expect(mockCollection.insertOne).toHaveBeenCalledWith(mockFavoritesAnnouncement);
      expect(result).toEqual(mockFavoritesAnnouncement);
    });

    it('should return null when insertion fails', async () => {
      // Arrange
      const mockInsertResult = {
        insertedId: null,
        acknowledged: false,
      };
      mockCollection.insertOne.mockResolvedValue(mockInsertResult);

      // Act
      const result = await repository.create(mockFavoritesAnnouncement);

      // Assert
      expect(mockCollection.insertOne).toHaveBeenCalledWith(mockFavoritesAnnouncement);
      expect(result).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should return all favorite announcements', async () => {
      // Arrange
      const mockFavorites = [
        { volunteerId: 'volunteer-1', announcementId: 'announcement-1' },
        { volunteerId: 'volunteer-2', announcementId: 'announcement-2' },
      ];
      const mockCursor = {
        toArray: jest.fn().mockResolvedValue(mockFavorites),
      };
      mockCollection.find.mockReturnValue(mockCursor);

      // Act
      const result = await repository.findAll();

      // Assert
      expect(mockCollection.find).toHaveBeenCalledWith();
      expect(mockCursor.toArray).toHaveBeenCalled();
      expect(result).toEqual(mockFavorites);
    });

    it('should return empty array when no favorites exist', async () => {
      // Arrange
      const mockCursor = {
        toArray: jest.fn().mockResolvedValue([]),
      };
      mockCollection.find.mockReturnValue(mockCursor);

      // Act
      const result = await repository.findAll();

      // Assert
      expect(mockCollection.find).toHaveBeenCalledWith();
      expect(mockCursor.toArray).toHaveBeenCalled();
      expect(result).toEqual([]);
    });
  });

  describe('removeByVolunteerIdAndAnnouncementId', () => {
    it('should remove a favorite announcement by volunteer ID and announcement ID', async () => {
      // Arrange
      const volunteerId = 'volunteer-123';
      const announcementId = 'announcement-456';
      const mockDeleteResult = {
        deletedCount: 1,
        acknowledged: true,
      };
      mockCollection.deleteOne.mockResolvedValue(mockDeleteResult);

      // Act
      const result = await repository.removeByVolunteerIdAndAnnouncementId(
        volunteerId,
        announcementId,
      );

      // Assert
      expect(mockCollection.deleteOne).toHaveBeenCalledWith({ volunteerId, announcementId });
      expect(result).toEqual(mockDeleteResult);
    });

    it('should return result with deletedCount 0 when no document is found', async () => {
      // Arrange
      const volunteerId = 'volunteer-123';
      const announcementId = 'announcement-456';
      const mockDeleteResult = {
        deletedCount: 0,
        acknowledged: true,
      };
      mockCollection.deleteOne.mockResolvedValue(mockDeleteResult);

      // Act
      const result = await repository.removeByVolunteerIdAndAnnouncementId(
        volunteerId,
        announcementId,
      );

      // Assert
      expect(mockCollection.deleteOne).toHaveBeenCalledWith({ volunteerId, announcementId });
      expect(result).toEqual(mockDeleteResult);
    });
  });

  describe('removeByVolunteerId', () => {
    it('should remove all favorite announcements for a specific volunteer', async () => {
      // Arrange
      const volunteerId = 'volunteer-123';
      const mockDeleteResult = {
        deletedCount: 3,
        acknowledged: true,
      };
      mockCollection.deleteMany.mockResolvedValue(mockDeleteResult);

      // Act
      const result = await repository.removeByVolunteerId(volunteerId);

      // Assert
      expect(mockCollection.deleteMany).toHaveBeenCalledWith({ volunteerId });
      expect(result).toEqual(mockDeleteResult);
    });

    it('should return result with deletedCount 0 when no documents are found', async () => {
      // Arrange
      const volunteerId = 'volunteer-123';
      const mockDeleteResult = {
        deletedCount: 0,
        acknowledged: true,
      };
      mockCollection.deleteMany.mockResolvedValue(mockDeleteResult);

      // Act
      const result = await repository.removeByVolunteerId(volunteerId);

      // Assert
      expect(mockCollection.deleteMany).toHaveBeenCalledWith({ volunteerId });
      expect(result).toEqual(mockDeleteResult);
    });
  });

  describe('removeByAnnouncementId', () => {
    it('should remove all favorite announcements for a specific announcement', async () => {
      // Arrange
      const announcementId = 'announcement-456';
      const mockDeleteResult = {
        deletedCount: 2,
        acknowledged: true,
      };
      mockCollection.deleteMany.mockResolvedValue(mockDeleteResult);

      // Act
      const result = await repository.removeByAnnouncementId(announcementId);

      // Assert
      expect(mockCollection.deleteMany).toHaveBeenCalledWith({ announcementId });
      expect(result).toEqual(mockDeleteResult);
    });

    it('should return result with deletedCount 0 when no documents are found', async () => {
      // Arrange
      const announcementId = 'announcement-456';
      const mockDeleteResult = {
        deletedCount: 0,
        acknowledged: true,
      };
      mockCollection.deleteMany.mockResolvedValue(mockDeleteResult);

      // Act
      const result = await repository.removeByAnnouncementId(announcementId);

      // Assert
      expect(mockCollection.deleteMany).toHaveBeenCalledWith({ announcementId });
      expect(result).toEqual(mockDeleteResult);
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
      const mockCursor = {
        toArray: jest.fn().mockResolvedValue(mockFavorites),
      };
      mockCollection.find.mockReturnValue(mockCursor);

      // Act
      const result = await repository.findAllByVolunteerId(volunteerId);

      // Assert
      expect(mockCollection.find).toHaveBeenCalledWith({ volunteerId });
      expect(mockCursor.toArray).toHaveBeenCalled();
      expect(result).toEqual(mockFavorites);
    });

    it('should return empty array when no favorites exist for volunteer', async () => {
      // Arrange
      const volunteerId = 'volunteer-123';
      const mockCursor = {
        toArray: jest.fn().mockResolvedValue([]),
      };
      mockCollection.find.mockReturnValue(mockCursor);

      // Act
      const result = await repository.findAllByVolunteerId(volunteerId);

      // Assert
      expect(mockCollection.find).toHaveBeenCalledWith({ volunteerId });
      expect(mockCursor.toArray).toHaveBeenCalled();
      expect(result).toEqual([]);
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
      const mockCursor = {
        toArray: jest.fn().mockResolvedValue(mockFavorites),
      };
      mockCollection.find.mockReturnValue(mockCursor);

      // Act
      const result = await repository.findAllByAnnouncementId(announcementId);

      // Assert
      expect(mockCollection.find).toHaveBeenCalledWith({ announcementId });
      expect(mockCursor.toArray).toHaveBeenCalled();
      expect(result).toEqual(mockFavorites);
    });

    it('should return empty array when no favorites exist for announcement', async () => {
      // Arrange
      const announcementId = 'announcement-456';
      const mockCursor = {
        toArray: jest.fn().mockResolvedValue([]),
      };
      mockCollection.find.mockReturnValue(mockCursor);

      // Act
      const result = await repository.findAllByAnnouncementId(announcementId);

      // Assert
      expect(mockCollection.find).toHaveBeenCalledWith({ announcementId });
      expect(mockCursor.toArray).toHaveBeenCalled();
      expect(result).toEqual([]);
    });
  });

  describe('collection getter', () => {
    it('should return the correct collection', () => {
      // Act
      const collection = (repository as any).collection;

      // Assert
      expect(mockMongoClient.db).toHaveBeenCalled();
      expect(mockMongoClient.db().collection).toHaveBeenCalledWith(DatabaseCollection.FAVORITES);
      expect(collection).toBe(mockCollection);
    });
  });
});
