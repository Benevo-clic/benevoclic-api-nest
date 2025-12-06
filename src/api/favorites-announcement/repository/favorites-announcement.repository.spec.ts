import { Test, TestingModule } from '@nestjs/testing';
import { FavoritesAnnouncementRepository } from './favorites-announcement.repository';
import { FavoritesAnnouncement } from '../entities/favorites-announcement.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

describe('FavoritesAnnouncementRepository', () => {
  let repository: FavoritesAnnouncementRepository;
  let mockTypeOrmRepository: Partial<Repository<FavoritesAnnouncement>>;
  let mockQueryBuilder: any;

  const mockFavoritesAnnouncement: FavoritesAnnouncement = {
    volunteerId: 'volunteer-123',
    announcementId: 'announcement-456',
  };

  beforeEach(async () => {
    mockQueryBuilder = {
      delete: jest.fn().mockReturnThis(),
      from: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      execute: jest.fn().mockResolvedValue({ affected: 1 }),
    };

    mockTypeOrmRepository = {
      findOneBy: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      delete: jest.fn(),
      findBy: jest.fn(),
      createQueryBuilder: jest.fn(() => mockQueryBuilder),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FavoritesAnnouncementRepository,
        {
          provide: getRepositoryToken(FavoritesAnnouncement),
          useValue: mockTypeOrmRepository,
        },
      ],
    }).compile();

    repository = module.get<FavoritesAnnouncementRepository>(FavoritesAnnouncementRepository);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('findByVolunteerIdAndAnnouncementId', () => {
    it('should find a favorite announcement by volunteer ID and announcement ID', async () => {
      (mockTypeOrmRepository.findOneBy as jest.Mock).mockResolvedValue(mockFavoritesAnnouncement);

      const result = await repository.findByVolunteerIdAndAnnouncementId(
        'volunteer-123',
        'announcement-456',
      );

      expect(mockTypeOrmRepository.findOneBy).toHaveBeenCalledWith({
        volunteerId: 'volunteer-123',
        announcementId: 'announcement-456',
      });
      expect(result).toEqual(mockFavoritesAnnouncement);
    });

    it('should throw error if inputs are not strings', async () => {
      await expect(
        repository.findByVolunteerIdAndAnnouncementId(123 as any, 'announcement-456'),
      ).rejects.toThrow('Invalid input: volunteerId and announcementId must be strings');
    });
  });

  describe('create', () => {
    it('should create a new favorite announcement', async () => {
      (mockTypeOrmRepository.create as jest.Mock).mockReturnValue(mockFavoritesAnnouncement);
      (mockTypeOrmRepository.save as jest.Mock).mockResolvedValue(mockFavoritesAnnouncement);

      const result = await repository.create(mockFavoritesAnnouncement);

      expect(mockTypeOrmRepository.create).toHaveBeenCalledWith(mockFavoritesAnnouncement);
      expect(mockTypeOrmRepository.save).toHaveBeenCalledWith(mockFavoritesAnnouncement);
      expect(result).toEqual(mockFavoritesAnnouncement);
    });
  });

  describe('findAll', () => {
    it('should return all favorite announcements', async () => {
      const mockFavorites = [mockFavoritesAnnouncement];
      (mockTypeOrmRepository.find as jest.Mock).mockResolvedValue(mockFavorites);

      const result = await repository.findAll();

      expect(mockTypeOrmRepository.find).toHaveBeenCalled();
      expect(result).toEqual(mockFavorites);
    });
  });

  describe('removeByVolunteerIdAndAnnouncementId', () => {
    it('should remove a favorite announcement', async () => {
      (mockTypeOrmRepository.delete as jest.Mock).mockResolvedValue({ affected: 1 });

      const result = await repository.removeByVolunteerIdAndAnnouncementId(
        'volunteer-123',
        'announcement-456',
      );

      expect(mockTypeOrmRepository.delete).toHaveBeenCalledWith({
        volunteerId: 'volunteer-123',
        announcementId: 'announcement-456',
      });
      expect(result).toEqual({ deletedCount: 1 });
    });
  });

  describe('removeByVolunteerId', () => {
    it('should remove favorites by volunteer ID', async () => {
      (mockTypeOrmRepository.delete as jest.Mock).mockResolvedValue({ affected: 2 });

      const result = await repository.removeByVolunteerId('volunteer-123');

      expect(mockTypeOrmRepository.delete).toHaveBeenCalledWith({ volunteerId: 'volunteer-123' });
      expect(result).toEqual({ deletedCount: 2 });
    });
  });

  describe('removeByAnnouncementId', () => {
    it('should remove favorites by announcement ID', async () => {
      (mockTypeOrmRepository.delete as jest.Mock).mockResolvedValue({ affected: 2 });

      const result = await repository.removeByAnnouncementId('announcement-456');

      expect(mockTypeOrmRepository.delete).toHaveBeenCalledWith({
        announcementId: 'announcement-456',
      });
      expect(result).toEqual({ deletedCount: 2 });
    });
  });

  describe('removeByAssociationId', () => {
    it('should remove favorites by association ID', async () => {
      const result = await repository.removeByAssociationId('association-123');

      expect(mockTypeOrmRepository.createQueryBuilder).toHaveBeenCalled();
      expect(mockQueryBuilder.delete).toHaveBeenCalled();
      expect(mockQueryBuilder.from).toHaveBeenCalledWith(FavoritesAnnouncement);
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        expect.stringContaining('announcementId IN'),
        { associationId: 'association-123' },
      );
      expect(result).toEqual({ deletedCount: 1 });
    });
  });

  describe('findAllByVolunteerId', () => {
    it('should return favorites by volunteer ID', async () => {
      const mockFavorites = [mockFavoritesAnnouncement];
      (mockTypeOrmRepository.findBy as jest.Mock).mockResolvedValue(mockFavorites);

      const result = await repository.findAllByVolunteerId('volunteer-123');

      expect(mockTypeOrmRepository.findBy).toHaveBeenCalledWith({ volunteerId: 'volunteer-123' });
      expect(result).toEqual(mockFavorites);
    });
  });

  describe('findAllByAnnouncementId', () => {
    it('should return favorites by announcement ID', async () => {
      const mockFavorites = [mockFavoritesAnnouncement];
      (mockTypeOrmRepository.findBy as jest.Mock).mockResolvedValue(mockFavorites);

      const result = await repository.findAllByAnnouncementId('announcement-456');

      expect(mockTypeOrmRepository.findBy).toHaveBeenCalledWith({
        announcementId: 'announcement-456',
      });
      expect(result).toEqual(mockFavorites);
    });
  });
});
