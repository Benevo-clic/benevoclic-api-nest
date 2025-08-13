import { Test, TestingModule } from '@nestjs/testing';
import { AnnouncementService } from './announcement.service';
import { AnnouncementRepository } from '../repositories/announcement.repository';
import { UserService } from '../../../common/services/user/user.service';
import { FavoritesAnnouncementService } from '../../favorites-announcement/services/favorites-announcement.service';
import { AwsS3Service } from '../../../common/aws/aws-s3.service';
import { SettingsService } from '../../settings/services/settings.service';
import { Logger } from '@nestjs/common';
import { FilterAssociationAnnouncementDto } from '../dto/filter-association-announcement.dto';
import { AnnouncementStatus } from '../interfaces/announcement.interface';

jest.mock('luxon', () => ({
  DateTime: {
    now: jest.fn().mockReturnValue({
      setZone: jest.fn().mockReturnValue({
        toJSDate: jest.fn().mockReturnValue(new Date('2024-01-15T10:00:00.000Z')),
        toISODate: jest.fn().mockReturnValue('2024-01-15'),
        toFormat: jest.fn().mockReturnValue('10:00'),
        startOf: jest.fn().mockReturnValue({
          toJSDate: jest.fn().mockReturnValue(new Date('2024-01-15T00:00:00.000Z')),
        }),
        endOf: jest.fn().mockReturnValue({
          toJSDate: jest.fn().mockReturnValue(new Date('2024-01-15T23:59:59.999Z')),
        }),
      }),
    }),
  },
}));

describe('AnnouncementService', () => {
  let service: AnnouncementService;
  let repository: AnnouncementRepository;
  let awsS3Service: AwsS3Service;
  let userService: UserService;

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
            filterAssociationAnnouncements: jest.fn(),
            findVolunteerInAnnouncementByVolunteerId: jest.fn(),
            findPastAnnouncementsByParticipantId: jest.fn(),
            findParticipantInParticipantsByParticipantId: jest.fn(),
            findWithAggregation: jest.fn(),
            updateAssociationNameByAssociationId: jest.fn(),
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
        {
          provide: SettingsService,
          useValue: {
            getAssociationSettings: jest.fn(),
            getVolunteerSettings: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AnnouncementService>(AnnouncementService);
    repository = module.get<AnnouncementRepository>(AnnouncementRepository);
    awsS3Service = module.get<AwsS3Service>(AwsS3Service);
    userService = module.get<UserService>(UserService);
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
    } as any;

    const mockAnnouncement = {
      _id: announcementId,
      announcementImage: 'old-image-key',
      associationId: 'assoc-123',
    };

    it('should update announcement avatar successfully', async () => {
      jest
        .spyOn(repository, 'findById')
        .mockResolvedValueOnce(mockAnnouncement as any)
        .mockResolvedValueOnce(mockAnnouncement as any);
      jest.spyOn(repository, 'update').mockResolvedValue(undefined);

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
        findById: jest.fn().mockResolvedValue({ announcementImage: 'image-key' }),
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
        {} as any, // settingsService
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
      const announcementRepository = {
        findById: jest.fn().mockResolvedValue(null),
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
        {} as any, // settingsService
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
        {} as any, // settingsService
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
        {} as any, // settingsService
      );

      await expect(serviceTest.deleteByAssociationId(associationId)).resolves.toBeUndefined();
      expect(announcementRepository.findByAssociationId).toHaveBeenCalledWith(associationId);
      expect(announcementRepository.deleteByAssociationId).not.toHaveBeenCalled();
    });

    it('should throw InternalServerErrorException if an error occurs', async () => {
      const associationId = 'assoc-id';
      const favoritesAnnouncementService = {
        removeByAssociationId: jest.fn().mockResolvedValue(undefined),
      };
      const announcementRepository = {
        findByAssociationId: jest.fn().mockRejectedValue(new Error('Database error')),
        deleteByAssociationId: jest.fn().mockResolvedValue(undefined),
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
        {} as any, // settingsService
      );
      await expect(serviceTest.deleteByAssociationId(associationId)).rejects.toThrow(
        "Erreur lors de la suppression des annonces de l'association",
      );
    });
  });

  describe('filterAssociationAnnouncements', () => {
    it('should return filtered announcements for association', async () => {
      const filterDto: FilterAssociationAnnouncementDto = {
        associationId: 'assoc-123',
        nameEvent: 'Test Event',
        status: 'ACTIVE',
        page: 1,
        limit: 10,
      };

      const mockAnnouncements = [
        { _id: '1', associationId: 'assoc-123', nameEvent: 'Test Event', status: 'ACTIVE' },
        { _id: '2', associationId: 'assoc-123', nameEvent: 'Another Event', status: 'ACTIVE' },
      ] as any;

      const mockResponse = {
        annonces: mockAnnouncements,
        meta: { page: 1, limit: 10, total: 2, pages: 1 },
      };

      jest.spyOn(repository, 'filterAssociationAnnouncements').mockResolvedValue(mockResponse);
      jest.spyOn(service, 'enrichAnnouncements').mockResolvedValue(mockAnnouncements);

      const result = await service.filterAssociationAnnouncements(filterDto);

      expect(repository.filterAssociationAnnouncements).toHaveBeenCalledWith(filterDto);
      expect(service.enrichAnnouncements).toHaveBeenCalledWith(mockAnnouncements);
      expect(result).toEqual({
        annonces: mockAnnouncements,
        meta: { page: 1, limit: 10, total: 2, pages: 1 },
      });
    });

    it('should handle errors during filtering', async () => {
      const filterDto: FilterAssociationAnnouncementDto = {
        associationId: 'assoc-123',
        page: 1,
        limit: 10,
      };

      jest
        .spyOn(repository, 'filterAssociationAnnouncements')
        .mockRejectedValue(new Error('Database error'));

      await expect(service.filterAssociationAnnouncements(filterDto)).rejects.toThrow(
        "Erreur lors de la récupération des annonces filtrées pour l'association",
      );
    });
  });

  describe('findVolunteerInAnnouncementByVolunteerId', () => {
    it('should return announcements where volunteer is registered', async () => {
      const volunteerId = 'vol-123';
      const mockAnnouncements = [
        {
          _id: '1',
          volunteers: [{ id: volunteerId }],
          dateEvent: '2024-02-15',
          hoursEvent: '14:00',
          status: 'ACTIVE',
        },
        {
          _id: '2',
          volunteersWaiting: [{ id: volunteerId }],
          dateEvent: '2024-02-16',
          hoursEvent: '15:00',
          status: 'ACTIVE',
        },
      ] as any;

      jest
        .spyOn(repository, 'findVolunteerInAnnouncementByVolunteerId')
        .mockResolvedValue(mockAnnouncements);
      jest.spyOn(service, 'enrichVolunteerAnnouncements').mockResolvedValue(mockAnnouncements);

      const result = await service.findVolunteerInAnnouncementByVolunteerId(volunteerId);

      expect(repository.findVolunteerInAnnouncementByVolunteerId).toHaveBeenCalledWith(volunteerId);
      expect(service.enrichVolunteerAnnouncements).toHaveBeenCalledWith(mockAnnouncements);
      expect(result).toEqual(mockAnnouncements);
    });

    it('should handle errors during search', async () => {
      const volunteerId = 'vol-123';

      jest
        .spyOn(repository, 'findVolunteerInAnnouncementByVolunteerId')
        .mockRejectedValue(new Error('Database error'));

      await expect(service.findVolunteerInAnnouncementByVolunteerId(volunteerId)).rejects.toThrow(
        'Erreur lors de la récupération des annonces pour le bénévole',
      );
    });
  });

  describe('findPastAnnouncementsByParticipantId', () => {
    it('should return past announcements for a participant', async () => {
      const participantId = 'part-123';
      const mockAnnouncements = [
        {
          _id: '1',
          dateEvent: '2024-01-10',
          hoursEvent: '09:00',
          participants: [{ id: participantId }],
          status: 'ACTIVE',
        },
        {
          _id: '2',
          dateEvent: '2024-01-14',
          hoursEvent: '08:00',
          volunteers: [{ id: participantId }],
          status: 'ACTIVE',
        },
      ] as any;

      jest
        .spyOn(repository, 'findPastAnnouncementsByParticipantId')
        .mockResolvedValue(mockAnnouncements);
      jest.spyOn(service, 'enrichVolunteerAnnouncements').mockResolvedValue(mockAnnouncements);

      const result = await service.findPastAnnouncementsByParticipantId(participantId);

      expect(repository.findPastAnnouncementsByParticipantId).toHaveBeenCalledWith(participantId);
      expect(service.enrichVolunteerAnnouncements).toHaveBeenCalledWith(mockAnnouncements);
      expect(result).toEqual(mockAnnouncements);
    });

    it('should handle errors during search', async () => {
      const participantId = 'part-123';

      jest
        .spyOn(repository, 'findPastAnnouncementsByParticipantId')
        .mockRejectedValue(new Error('Database error'));

      await expect(service.findPastAnnouncementsByParticipantId(participantId)).rejects.toThrow(
        'Erreur lors de la récupération des annonces passées pour le participant',
      );
    });
  });

  describe('findParticipantInParticipantsByParticipantId', () => {
    it('should return future announcements for a participant', async () => {
      const participantId = 'part-123';
      const mockAnnouncements = [
        {
          _id: '1',
          dateEvent: '2024-02-15',
          hoursEvent: '14:00',
          participants: [{ id: participantId }],
          status: 'ACTIVE',
        },
        {
          _id: '2',
          dateEvent: '2024-02-16',
          hoursEvent: '15:00',
          participants: [{ id: participantId }],
          status: 'ACTIVE',
        },
      ] as any;

      jest
        .spyOn(repository, 'findParticipantInParticipantsByParticipantId')
        .mockResolvedValue(mockAnnouncements);
      jest.spyOn(service, 'enrichVolunteerAnnouncements').mockResolvedValue(mockAnnouncements);

      const result = await service.findParticipantInParticipantsByParticipantId(participantId);

      expect(repository.findParticipantInParticipantsByParticipantId).toHaveBeenCalledWith(
        participantId,
      );
      expect(service.enrichVolunteerAnnouncements).toHaveBeenCalledWith(mockAnnouncements);
      expect(result).toEqual(mockAnnouncements);
    });

    it('should handle errors during search', async () => {
      const participantId = 'part-123';

      jest
        .spyOn(repository, 'findParticipantInParticipantsByParticipantId')
        .mockRejectedValue(new Error('Database error'));

      await expect(
        service.findParticipantInParticipantsByParticipantId(participantId),
      ).rejects.toThrow('Erreur lors de la récupération des annonces pour le participant');
    });
  });

  describe('enrichAnnouncements', () => {
    it('should enrich announcements with association logos', async () => {
      const mockAnnouncements = [
        { _id: '1', associationId: 'assoc-1', status: 'ACTIVE' },
        { _id: '2', associationId: 'assoc-2', status: 'COMPLETED' },
      ] as any;

      jest
        .spyOn(userService, 'getAvatarFileUrl')
        .mockResolvedValue('https://example.com/logo1.jpg');

      const result = await service.enrichAnnouncements(mockAnnouncements);

      expect(result).toEqual(mockAnnouncements);
      expect(userService.getAvatarFileUrl).toHaveBeenCalledTimes(2);
    });
  });

  describe('isCompletedVolunteer', () => {
    it('should return true when volunteer count equals max volunteers', async () => {
      const announcement = {
        nbVolunteers: 2,
        maxVolunteers: 2,
      } as any;

      const result = service.isCompletedVolunteer(announcement, true);
      expect(result).toBe(true);
    });

    it('should return false when volunteer count is less than max volunteers', async () => {
      const announcement = {
        nbVolunteers: 1,
        maxVolunteers: 2,
      } as any;

      const result = service.isCompletedVolunteer(announcement, true);
      expect(result).toBe(false);
    });
  });

  describe('isCompletedParticipant', () => {
    it('should return true when participant count equals max participants', async () => {
      const announcement = {
        nbParticipants: 2,
        maxParticipants: 2,
      } as any;

      const result = await service.isCompletedParticipant(announcement, true);
      expect(result).toBe(true);
    });

    it('should return false when participant count is less than max participants', async () => {
      const announcement = {
        nbParticipants: 1,
        maxParticipants: 2,
      } as any;

      const result = await service.isCompletedParticipant(announcement, true);
      expect(result).toBe(false);
    });
  });

  describe('isVolunteer', () => {
    it('should return true when volunteer is in volunteers array', async () => {
      const announcement = {
        volunteers: [{ id: 'vol-1' }, { id: 'vol-2' }],
      } as any;

      const result = await service.isVolunteer(announcement, 'vol-1');
      expect(result).toBe(true);
    });

    it('should return false when volunteer is not in volunteers array', async () => {
      const announcement = {
        volunteers: [{ id: 'vol-1' }, { id: 'vol-2' }],
      } as any;

      const result = await service.isVolunteer(announcement, 'vol-3');
      expect(result).toBe(false);
    });
  });

  describe('isVolunteerWaiting', () => {
    it('should return true when volunteer is in volunteersWaiting array', async () => {
      const announcement = {
        volunteersWaiting: [{ id: 'vol-1' }, { id: 'vol-2' }],
      } as any;

      const result = await service.isVolunteerWaiting(announcement, 'vol-1');
      expect(result).toBe(true);
    });

    it('should return false when volunteer is not in volunteersWaiting array', async () => {
      const announcement = {
        volunteersWaiting: [{ id: 'vol-1' }, { id: 'vol-2' }],
      } as any;

      const result = await service.isVolunteerWaiting(announcement, 'vol-3');
      expect(result).toBe(false);
    });
  });

  describe('isParticipant', () => {
    it('should return true when participant is in participants array', async () => {
      const announcement = {
        participants: [{ id: 'part-1' }, { id: 'part-2' }],
      } as any;

      const result = await service.isParticipant(announcement, 'part-1');
      expect(result).toBe(true);
    });

    it('should return false when participant is not in participants array', async () => {
      const announcement = {
        participants: [{ id: 'part-1' }, { id: 'part-2' }],
      } as any;

      const result = await service.isParticipant(announcement, 'part-3');
      expect(result).toBe(false);
    });
  });

  describe('updateAnnouncementAssociationName', () => {
    it('should update association name for all announcements', async () => {
      const associationId = 'assoc-123';
      const associationName = 'New Association Name';
      const mockAnnouncements = [{ id: 'ann-1' }, { id: 'ann-2' }];

      jest.spyOn(repository, 'findByAssociationId').mockResolvedValue(mockAnnouncements as any);
      jest.spyOn(repository, 'updateAssociationNameByAssociationId').mockResolvedValue(undefined);

      await service.updateAnnouncementAssociationName(associationId, associationName);

      expect(repository.findByAssociationId).toHaveBeenCalledWith(associationId);
      expect(repository.updateAssociationNameByAssociationId).toHaveBeenCalledWith(
        associationId,
        associationName,
      );
    });

    it('should handle errors during update', async () => {
      const associationId = 'assoc-123';
      const associationName = 'New Association Name';

      jest.spyOn(repository, 'findByAssociationId').mockRejectedValue(new Error('Database error'));

      await expect(
        service.updateAnnouncementAssociationName(associationId, associationName),
      ).rejects.toThrow("Erreur lors de la mise à jour du nom de l'association dans les annonces");
    });
  });

  describe('getAvatarFileUrl', () => {
    it('should return avatar file URL', async () => {
      const id = 'ann-123';
      const expectedUrl = 'https://example.com/avatar.jpg';
      const mockAnnouncement = { announcementImage: 'avatar-key' };

      jest.spyOn(repository, 'findById').mockResolvedValue(mockAnnouncement as any);
      jest.spyOn(awsS3Service, 'getFileUrl').mockResolvedValue(expectedUrl);

      const result = await service.getAvatarFileUrl(id);

      expect(result).toBe(expectedUrl);
      expect(repository.findById).toHaveBeenCalledWith(id);
      expect(awsS3Service.getFileUrl).toHaveBeenCalledWith('avatar-key');
    });

    it('should return empty string when no avatar', async () => {
      const id = 'ann-123';
      const mockAnnouncement = { announcementImage: null };

      jest.spyOn(repository, 'findById').mockResolvedValue(mockAnnouncement as any);

      const result = await service.getAvatarFileUrl(id);

      expect(result).toBe('');
    });
  });

  describe('updatePresentParticipant', () => {
    it('should update present participant', async () => {
      const participant = { id: 'part-123', name: 'John Doe', isPresent: true } as any;
      const announcementId = 'ann-123';
      const mockAnnouncement = {
        participants: [{ id: 'part-123', name: 'John Doe', isPresent: false }],
      };

      jest.spyOn(repository, 'findById').mockResolvedValue(mockAnnouncement as any);
      jest.spyOn(repository, 'updateVolunteer').mockResolvedValue(undefined);

      const result = await service.updatePresentParticipant(participant, announcementId);

      expect(result).toEqual({ ...participant, isPresent: true });
      expect(repository.findById).toHaveBeenCalledWith(announcementId);
      expect(repository.updateVolunteer).toHaveBeenCalledWith(announcementId, mockAnnouncement);
    });

    it('should handle announcement not found', async () => {
      const participant = { id: 'part-123', name: 'John Doe' } as any;
      const announcementId = 'ann-123';

      jest.spyOn(repository, 'findById').mockResolvedValue(null);

      await expect(service.updatePresentParticipant(participant, announcementId)).rejects.toThrow(
        'Announcement not found',
      );
    });

    it('should handle participant not registered', async () => {
      const participant = { id: 'part-123', name: 'John Doe' } as any;
      const announcementId = 'ann-123';
      const mockAnnouncement = { participants: [] };

      jest.spyOn(repository, 'findById').mockResolvedValue(mockAnnouncement as any);

      await expect(service.updatePresentParticipant(participant, announcementId)).rejects.toThrow(
        'Participant not registered',
      );
    });
  });

  describe('updatePresentVolunteer', () => {
    it('should update present volunteer', async () => {
      const volunteer = { id: 'vol-123', name: 'John Doe', isPresent: true } as any;
      const announcementId = 'ann-123';
      const mockAnnouncement = {
        volunteers: [{ id: 'vol-123', name: 'John Doe', isPresent: false }],
      };

      jest.spyOn(repository, 'findById').mockResolvedValue(mockAnnouncement as any);
      jest.spyOn(repository, 'updateVolunteer').mockResolvedValue(undefined);

      const result = await service.updatePresentVolunteer(volunteer, announcementId);

      expect(result).toEqual({ ...volunteer, isPresent: true });
      expect(repository.findById).toHaveBeenCalledWith(announcementId);
      expect(repository.updateVolunteer).toHaveBeenCalledWith(announcementId, mockAnnouncement);
    });

    it('should handle announcement not found', async () => {
      const volunteer = { id: 'vol-123', name: 'John Doe' } as any;
      const announcementId = 'ann-123';

      jest.spyOn(repository, 'findById').mockResolvedValue(null);

      await expect(service.updatePresentVolunteer(volunteer, announcementId)).rejects.toThrow(
        'Announcement not found',
      );
    });

    it('should handle volunteer not registered', async () => {
      const volunteer = { id: 'vol-123', name: 'John Doe' } as any;
      const announcementId = 'ann-123';
      const mockAnnouncement = { volunteers: [] };

      jest.spyOn(repository, 'findById').mockResolvedValue(mockAnnouncement as any);

      await expect(service.updatePresentVolunteer(volunteer, announcementId)).rejects.toThrow(
        'Volunteer not registered',
      );
    });
  });

  describe('updateStatus', () => {
    it('should update announcement status', async () => {
      const id = 'ann-123';
      const status = 'COMPLETED' as AnnouncementStatus;

      jest.spyOn(repository, 'updateStatus').mockResolvedValue(undefined);

      await service.updateStatus(id, status);

      expect(repository.updateStatus).toHaveBeenCalledWith(id, status);
    });

    it('should handle errors during status update', async () => {
      const id = 'ann-123';
      const status = 'COMPLETED' as AnnouncementStatus;

      jest.spyOn(repository, 'updateStatus').mockRejectedValue(new Error('Database error'));

      await expect(service.updateStatus(id, status)).rejects.toThrow(
        "Erreur lors de la mise à jour du statut de l'annonce",
      );
    });
  });

  describe('removeVolunteerEverywhere', () => {
    it('should remove volunteer from all announcements', async () => {
      const volunteerId = 'vol-123';
      const expectedCount = 3;

      jest.spyOn(repository, 'removeVolunteerEverywhere').mockResolvedValue(expectedCount);

      const result = await service.removeVolunteerEverywhere(volunteerId);

      expect(repository.removeVolunteerEverywhere).toHaveBeenCalledWith(volunteerId);
      expect(result).toBe(expectedCount);
    });

    it('should handle errors during removal', async () => {
      const volunteerId = 'vol-123';

      jest
        .spyOn(repository, 'removeVolunteerEverywhere')
        .mockRejectedValue(new Error('Database error'));

      await expect(service.removeVolunteerEverywhere(volunteerId)).rejects.toThrow(
        'Erreur lors de la suppression du bénévole dans toutes les annonces',
      );
    });
  });

  describe('removeParticipantEverywhere', () => {
    it('should remove participant from all announcements', async () => {
      const participantId = 'part-123';
      const expectedCount = 2;

      jest.spyOn(repository, 'removeParticipantEverywhere').mockResolvedValue(expectedCount);

      const result = await service.removeParticipantEverywhere(participantId);

      expect(repository.removeParticipantEverywhere).toHaveBeenCalledWith(participantId);
      expect(result).toBe(expectedCount);
    });

    it('should handle errors during removal', async () => {
      const participantId = 'part-123';

      jest
        .spyOn(repository, 'removeParticipantEverywhere')
        .mockRejectedValue(new Error('Database error'));

      await expect(service.removeParticipantEverywhere(participantId)).rejects.toThrow(
        'Erreur lors de la suppression du participant dans toutes les annonces',
      );
    });
  });
});
