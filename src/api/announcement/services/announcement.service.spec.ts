import { Test, TestingModule } from '@nestjs/testing';
import { AnnouncementService } from './announcement.service';
import { AnnouncementRepository } from '../repositories/announcement.repository';
import { UserService } from '../../../common/services/user/user.service';
import { Logger } from '@nestjs/common';
import { FavoritesAnnouncementService } from '../../favorites-announcement/services/favorites-announcement.service';
import { AwsS3Service } from '../../../common/aws/aws-s3.service';

describe('AnnouncementService', () => {
  let service: AnnouncementService;
  let repository: AnnouncementRepository;
  let awsS3Service: AwsS3Service;

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
            removeVolunteerEverywhere: jest.fn(),
            removeParticipantEverywhere: jest.fn(),
          },
        },
        {
          provide: UserService,
          useValue: {
            getUserImageProfile: jest.fn(),
            getAvatarFileUrl: jest.fn(),
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
          provide: FavoritesAnnouncementService,
          useValue: {
            removeByAnnouncementId: jest.fn(),
            removeByAssociationId: jest.fn(),
            findAll: jest.fn(),
            removeByVolunteerIdAndAnnouncementId: jest.fn(),
          },
        },
        {
          provide: AwsS3Service,
          useValue: {
            uploadFileAnnouncement: jest.fn(),
            deleteFile: jest.fn(),
            getFileUrl: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AnnouncementService>(AnnouncementService);
    repository = module.get<AnnouncementRepository>(AnnouncementRepository);
    awsS3Service = module.get<AwsS3Service>(AwsS3Service);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('updateAvatar', () => {
    const announcementId = 'test-announcement-id';
    const mockFile = {
      buffer: Buffer.from('test-image-data'),
      mimetype: 'image/jpeg',
      originalname: 'test.jpg',
      fieldname: 'file',
      size: 1024,
    } as any; // Utiliser 'as any' pour éviter les problèmes de type

    const mockAnnouncement = {
      _id: announcementId,
      announcementImage: 'old-image-key',
      associationId: 'assoc-123',
    };

    it('should update announcement avatar successfully', async () => {
      // Mock repository methods
      jest
        .spyOn(repository, 'findById')
        .mockResolvedValueOnce(mockAnnouncement as any)
        .mockResolvedValueOnce(mockAnnouncement as any);
      jest.spyOn(repository, 'update').mockResolvedValue(undefined);

      // Mock AWS S3 service
      jest
        .spyOn(awsS3Service, 'uploadFileAnnouncement')
        .mockResolvedValue({ fileKey: 'new-image-key' });
      jest.spyOn(awsS3Service, 'deleteFile').mockResolvedValue(undefined);

      const result = await service.updateAvatar(announcementId, mockFile);

      expect(repository.findById).toHaveBeenCalledWith(announcementId);
      expect(awsS3Service.uploadFileAnnouncement).toHaveBeenCalledWith(announcementId, mockFile);
      expect(repository.update).toHaveBeenCalledWith(announcementId, {
        announcementImage: 'new-image-key',
      });
      expect(awsS3Service.deleteFile).toHaveBeenCalledWith('old-image-key');
      expect(result).toEqual(mockAnnouncement);
    });

    it('should throw InternalServerErrorException when announcement not found', async () => {
      jest.spyOn(repository, 'findById').mockResolvedValue(null);

      await expect(service.updateAvatar(announcementId, mockFile)).rejects.toThrow(
        "Erreur lors de la mise à jour de l'avatar",
      );
    });

    it('should not delete old image if announcementImage is empty', async () => {
      const announcementWithoutImage = {
        ...mockAnnouncement,
        announcementImage: '',
      };

      jest
        .spyOn(repository, 'findById')
        .mockResolvedValueOnce(announcementWithoutImage as any)
        .mockResolvedValueOnce(announcementWithoutImage as any);
      jest.spyOn(repository, 'update').mockResolvedValue(undefined);
      jest
        .spyOn(awsS3Service, 'uploadFileAnnouncement')
        .mockResolvedValue({ fileKey: 'new-image-key' });

      await service.updateAvatar(announcementId, mockFile);

      expect(awsS3Service.deleteFile).not.toHaveBeenCalled();
    });

    it('should not delete old image if it is the same as new image', async () => {
      jest
        .spyOn(repository, 'findById')
        .mockResolvedValueOnce(mockAnnouncement as any)
        .mockResolvedValueOnce(mockAnnouncement as any);
      jest.spyOn(repository, 'update').mockResolvedValue(undefined);
      jest
        .spyOn(awsS3Service, 'uploadFileAnnouncement')
        .mockResolvedValue({ fileKey: 'old-image-key' });

      await service.updateAvatar(announcementId, mockFile);

      expect(awsS3Service.deleteFile).not.toHaveBeenCalled();
    });

    it('should throw InternalServerErrorException when AWS upload fails', async () => {
      jest.spyOn(repository, 'findById').mockResolvedValue(mockAnnouncement as any);
      jest.spyOn(awsS3Service, 'uploadFileAnnouncement').mockRejectedValue(new Error('AWS error'));

      await expect(service.updateAvatar(announcementId, mockFile)).rejects.toThrow(
        "Erreur lors de la mise à jour de l'avatar",
      );
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
      const awsS3Service = {
        uploadFileAnnouncement: jest.fn(),
        deleteFile: jest.fn(),
        getFileUrl: jest.fn(),
      };
      const serviceTest = new AnnouncementService(
        announcementRepository as any,
        {} as any,
        favoritesAnnouncementService as any,
        awsS3Service as any,
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
      const awsS3Service = {
        uploadFileAnnouncement: jest.fn(),
        deleteFile: jest.fn(),
        getFileUrl: jest.fn(),
      };
      const serviceTest = new AnnouncementService(
        {} as any,
        {} as any,
        favoritesAnnouncementService as any,
        awsS3Service as any,
      );
      await expect(serviceTest.delete(id)).rejects.toThrow(
        "Erreur lors de la suppression de l'annonce",
      );
    });
  });

  describe('deleteByAssociationId', () => {
    it('should call favoritesAnnouncementService and repository deleteByAssociationId', async () => {
      const associationId = 'assoc-id';
      const mockAnnouncements = [
        { _id: 'announcement-1', announcementImage: 'image-1' },
        { _id: 'announcement-2', announcementImage: 'image-2' },
      ];

      const favoritesAnnouncementService = {
        removeByAssociationId: jest.fn().mockResolvedValue(undefined),
      };
      const announcementRepository = {
        deleteByAssociationId: jest.fn().mockResolvedValue(undefined),
        findByAssociationId: jest.fn().mockResolvedValue(mockAnnouncements),
      };
      const awsS3Service = {
        uploadFileAnnouncement: jest.fn(),
        deleteFile: jest.fn().mockResolvedValue(undefined),
        getFileUrl: jest.fn(),
      };
      const serviceTest = new AnnouncementService(
        announcementRepository as any,
        {} as any,
        favoritesAnnouncementService as any,
        awsS3Service as any,
      );

      await expect(serviceTest.deleteByAssociationId(associationId)).resolves.toBeUndefined();
      expect(announcementRepository.findByAssociationId).toHaveBeenCalledWith(associationId);
      expect(awsS3Service.deleteFile).toHaveBeenCalledTimes(2);
      expect(favoritesAnnouncementService.removeByAssociationId).toHaveBeenCalledWith(
        associationId,
      );
      expect(announcementRepository.deleteByAssociationId).toHaveBeenCalledWith(associationId);
    });

    it('should handle case when no announcements found', async () => {
      const associationId = 'assoc-id';
      const favoritesAnnouncementService = {
        removeByAssociationId: jest.fn().mockResolvedValue(undefined),
      };
      const announcementRepository = {
        deleteByAssociationId: jest.fn().mockResolvedValue(undefined),
        findByAssociationId: jest.fn().mockResolvedValue([]),
      };
      const awsS3Service = {
        uploadFileAnnouncement: jest.fn(),
        deleteFile: jest.fn(),
        getFileUrl: jest.fn(),
      };
      const serviceTest = new AnnouncementService(
        announcementRepository as any,
        {} as any,
        favoritesAnnouncementService as any,
        awsS3Service as any,
      );

      await expect(serviceTest.deleteByAssociationId(associationId)).resolves.toBeUndefined();
      expect(announcementRepository.findByAssociationId).toHaveBeenCalledWith(associationId);
      expect(announcementRepository.deleteByAssociationId).not.toHaveBeenCalled();
    });

    it('should throw InternalServerErrorException if an error occurs', async () => {
      const associationId = 'assoc-id';
      const favoritesAnnouncementService = {
        removeByAssociationId: jest.fn().mockRejectedValue(new Error('fail')),
      };
      const awsS3Service = {
        uploadFileAnnouncement: jest.fn(),
        deleteFile: jest.fn(),
        getFileUrl: jest.fn(),
      };
      const serviceTest = new AnnouncementService(
        {} as any,
        {} as any,
        favoritesAnnouncementService as any,
        awsS3Service as any,
      );
      await expect(serviceTest.deleteByAssociationId(associationId)).rejects.toThrow(
        "Erreur lors de la suppression des annonces de l'association",
      );
    });
  });

  describe('removeVolunteerEverywhere', () => {
    it('should call repository and return modified count', async () => {
      const volunteerId = 'vol-123';
      const modifiedCount = 3;
      // Mock la méthode du repository
      repository.removeVolunteerEverywhere = jest.fn().mockResolvedValue(modifiedCount);

      const result = await service.removeVolunteerEverywhere(volunteerId);

      expect(repository.removeVolunteerEverywhere).toHaveBeenCalledWith(volunteerId);
      expect(result).toBe(modifiedCount);
    });

    it('should throw InternalServerErrorException if repository throws', async () => {
      const volunteerId = 'vol-123';
      repository.removeVolunteerEverywhere = jest
        .fn()
        .mockRejectedValue(new Error('Database error'));

      await expect(service.removeVolunteerEverywhere(volunteerId)).rejects.toThrow(
        'Erreur lors de la suppression du bénévole dans toutes les annonces',
      );
    });

    it('should log error when repository throws', async () => {
      const volunteerId = 'vol-456';
      const error = new Error('Database connection failed');
      repository.removeVolunteerEverywhere = jest.fn().mockRejectedValue(error);

      // Mock le logger pour vérifier qu'il est appelé
      const loggerSpy = jest.spyOn(service['logger'], 'error');

      await expect(service.removeVolunteerEverywhere(volunteerId)).rejects.toThrow(
        'Erreur lors de la suppression du bénévole dans toutes les annonces',
      );

      expect(loggerSpy).toHaveBeenCalledWith(
        `Erreur lors de la suppression du bénévole ${volunteerId} dans toutes les annonces`,
        error.stack,
      );
    });

    it('should return 0 when no volunteers are found', async () => {
      const volunteerId = 'vol-789';
      repository.removeVolunteerEverywhere = jest.fn().mockResolvedValue(0);

      const result = await service.removeVolunteerEverywhere(volunteerId);

      expect(repository.removeVolunteerEverywhere).toHaveBeenCalledWith(volunteerId);
      expect(result).toBe(0);
    });

    it('should handle empty volunteerId', async () => {
      const volunteerId = '';
      repository.removeVolunteerEverywhere = jest.fn().mockResolvedValue(0);

      const result = await service.removeVolunteerEverywhere(volunteerId);

      expect(repository.removeVolunteerEverywhere).toHaveBeenCalledWith(volunteerId);
      expect(result).toBe(0);
    });

    it('should handle null volunteerId', async () => {
      const volunteerId = null;
      repository.removeVolunteerEverywhere = jest.fn().mockResolvedValue(0);

      const result = await service.removeVolunteerEverywhere(volunteerId);

      expect(repository.removeVolunteerEverywhere).toHaveBeenCalledWith(volunteerId);
      expect(result).toBe(0);
    });

    it('should handle undefined volunteerId', async () => {
      const volunteerId = undefined;
      repository.removeVolunteerEverywhere = jest.fn().mockResolvedValue(0);

      const result = await service.removeVolunteerEverywhere(volunteerId);

      expect(repository.removeVolunteerEverywhere).toHaveBeenCalledWith(volunteerId);
      expect(result).toBe(0);
    });
  });

  describe('removeParticipantEverywhere', () => {
    it('should call repository and return modified count', async () => {
      const participantId = 'participant-123';
      const modifiedCount = 2;

      repository.removeParticipantEverywhere = jest.fn().mockResolvedValue(modifiedCount);

      const result = await service.removeParticipantEverywhere(participantId);

      expect(repository.removeParticipantEverywhere).toHaveBeenCalledWith(participantId);
      expect(result).toBe(modifiedCount);
    });

    it('should throw InternalServerErrorException if repository throws', async () => {
      const participantId = 'participant-123';
      repository.removeParticipantEverywhere = jest
        .fn()
        .mockRejectedValue(new Error('Database error'));

      await expect(service.removeParticipantEverywhere(participantId)).rejects.toThrow(
        'Erreur lors de la suppression du participant dans toutes les annonces',
      );
    });

    it('should log error when repository throws', async () => {
      const participantId = 'participant-456';
      const error = new Error('Database connection failed');
      repository.removeParticipantEverywhere = jest.fn().mockRejectedValue(error);

      // Mock le logger pour vérifier qu'il est appelé
      const loggerSpy = jest.spyOn(service['logger'], 'error');

      await expect(service.removeParticipantEverywhere(participantId)).rejects.toThrow(
        'Erreur lors de la suppression du participant dans toutes les annonces',
      );

      expect(loggerSpy).toHaveBeenCalledWith(
        `Erreur lors de la suppression du participant ${participantId} dans toutes les annonces`,
        error.stack,
      );
    });

    it('should return 0 when no participants are found', async () => {
      const participantId = 'participant-789';
      repository.removeParticipantEverywhere = jest.fn().mockResolvedValue(0);

      const result = await service.removeParticipantEverywhere(participantId);

      expect(repository.removeParticipantEverywhere).toHaveBeenCalledWith(participantId);
      expect(result).toBe(0);
    });

    it('should handle empty participantId', async () => {
      const participantId = '';
      repository.removeParticipantEverywhere = jest.fn().mockResolvedValue(0);

      const result = await service.removeParticipantEverywhere(participantId);

      expect(repository.removeParticipantEverywhere).toHaveBeenCalledWith(participantId);
      expect(result).toBe(0);
    });
  });
});
