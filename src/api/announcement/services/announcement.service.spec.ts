import { Test, TestingModule } from '@nestjs/testing';
import { AnnouncementService } from './announcement.service';
import { AnnouncementRepository } from '../repositories/announcement.repository';
import { UserService } from '../../../common/services/user/user.service';
import { Logger } from '@nestjs/common';
import { Image } from '../../../common/type/usersInfo.type';
import { FavoritesAnnouncementService } from '../../favorites-announcement/services/favorites-announcement.service';

describe('AnnouncementService', () => {
  let service: AnnouncementService;
  let repository: AnnouncementRepository;

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
          provide: 'FavoritesAnnouncementService',
          useValue: {
            removeByAnnouncementId: jest.fn(),
            removeByAssociationId: jest.fn(),
            findAll: jest.fn(),
            removeByVolunteerIdAndAnnouncementId: jest.fn(),
          },
        },
        {
          provide: FavoritesAnnouncementService,
          useValue: {
            removeByAnnouncementId: jest.fn(),
            removeByAssociationId: jest.fn(),
            findAll: jest.fn(),
            removeByVolunteerIdAndAnnouncementId: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AnnouncementService>(AnnouncementService);
    repository = module.get<AnnouncementRepository>(AnnouncementRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
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
    });

    it('should throw an error when no file is provided', async () => {
      await expect(service.updateCover(announcementId, null)).rejects.toThrow(
        'Aucun fichier fourni.',
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

  describe('delete', () => {
    it('should call favoritesAnnouncementService and repository delete', async () => {
      const id = 'test-id';
      const favoritesAnnouncementService = {
        removeByAnnouncementId: jest.fn().mockResolvedValue(undefined),
      };
      const announcementRepository = {
        delete: jest.fn().mockResolvedValue(undefined),
      };
      const serviceTest = new AnnouncementService(
        announcementRepository as any,
        {} as any,
        favoritesAnnouncementService as any,
      );
      await expect(serviceTest.delete(id)).resolves.toBeUndefined();
      expect(favoritesAnnouncementService.removeByAnnouncementId).toHaveBeenCalledWith(id);
      expect(announcementRepository.delete).toHaveBeenCalledWith(id);
    });

    it('should throw InternalServerErrorException if an error occurs', async () => {
      const id = 'test-id';
      const favoritesAnnouncementService = {
        removeByAnnouncementId: jest.fn().mockRejectedValue(new Error('fail')),
      };
      const serviceTest = new AnnouncementService(
        {} as any,
        {} as any,
        favoritesAnnouncementService as any,
      );
      await expect(serviceTest.delete(id)).rejects.toThrow(
        "Erreur lors de la suppression de l'annonce",
      );
    });
  });

  describe('deleteByAssociationId', () => {
    it('should call favoritesAnnouncementService and repository deleteByAssociationId', async () => {
      const associationId = 'assoc-id';
      const favoritesAnnouncementService = {
        removeByAssociationId: jest.fn().mockResolvedValue(undefined),
      };
      const announcementRepository = {
        deleteByAssociationId: jest.fn().mockResolvedValue(undefined),
      };
      const serviceTest = new AnnouncementService(
        announcementRepository as any,
        {} as any,
        favoritesAnnouncementService as any,
      );
      await expect(serviceTest.deleteByAssociationId(associationId)).resolves.toBeUndefined();
      expect(favoritesAnnouncementService.removeByAssociationId).toHaveBeenCalledWith(
        associationId,
      );
      expect(announcementRepository.deleteByAssociationId).toHaveBeenCalledWith(associationId);
    });

    it('should throw InternalServerErrorException if an error occurs', async () => {
      const associationId = 'assoc-id';
      const favoritesAnnouncementService = {
        removeByAssociationId: jest.fn().mockRejectedValue(new Error('fail')),
      };
      const serviceTest = new AnnouncementService(
        {} as any,
        {} as any,
        favoritesAnnouncementService as any,
      );
      await expect(serviceTest.deleteByAssociationId(associationId)).rejects.toThrow(
        "Erreur lors de la suppression des annonces de l'association",
      );
    });
  });
});
