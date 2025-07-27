import { AnnouncementController } from './announcement.controller';
import { ObjectId } from 'mongodb';
import { Test, TestingModule } from '@nestjs/testing';
import { AnnouncementService } from '../services/announcement.service';
import * as mockData from '../../../../test/testFiles/announcement.data.json';
import { CreateAnnouncementDto } from '../dto/create-announcement.dto';
import { AnnouncementStatus } from '../interfaces/announcement.interface';
import { InfoVolunteerDto } from '../../association/dto/info-volunteer.dto';
import { FilterAnnouncementDto } from '../dto/filter-announcement.dto';

describe('AnnouncementController', () => {
  let announcementController: AnnouncementController;
  let announcementService: AnnouncementService;
  let module: TestingModule;

  beforeAll(async () => {
    const mockAnnouncementService = {
      removeVolunteerWaiting: jest.fn(),
      registerVolunteer: jest.fn(),
      isVolunteer: jest.fn(),
      removeVolunteer: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      findByAssociationId: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      deleteByAssociationId: jest.fn(),
      registerParticipant: jest.fn(),
      removeParticipant: jest.fn(),
      registerVolunteerWaiting: jest.fn(),
      updateStatus: jest.fn(),
      filterAnnouncementsAggregation: jest.fn(),
      filterAssociationAnnouncements: jest.fn(),
      findVolunteerInAnnouncementByVolunteerId: jest.fn(),
      findPastAnnouncementsByParticipantId: jest.fn(),
      findParticipantInParticipantsByParticipantId: jest.fn(),
      addVolunteer: jest.fn(),
      updatePresentVolunteer: jest.fn(),
      updatePresentParticipant: jest.fn(),
      updateAvatar: jest.fn(),
    };

    module = await Test.createTestingModule({
      controllers: [AnnouncementController],
      providers: [
        {
          provide: AnnouncementService,
          useValue: mockAnnouncementService,
        },
      ],
    }).compile();

    announcementController = module.get<AnnouncementController>(AnnouncementController);
    announcementService = module.get<AnnouncementService>(AnnouncementService);
  });

  afterAll(async () => {
    await module.close();
  });

  describe('findAll', () => {
    it('should return all announcements', async () => {
      announcementService.findAll = jest.fn().mockReturnValue(mockData.announcements);
      const announcements = await announcementController.findAll();
      expect(announcements).toBeDefined();
      expect(Array.isArray(announcements)).toBe(true);
    });
  });

  describe('findById', () => {
    it('should return an announcement by id', async () => {
      announcementService.findById = jest.fn().mockReturnValue(mockData.announcements[0]);
      const announcement = await announcementController.findById('67a89edbafdcf40d022aac89');
      expect(announcement).toBeDefined();
    });
  });

  describe('findByAssociationId', () => {
    it('should return an array of announcements by associationId', async () => {
      announcementService.findByAssociationId = jest
        .fn()
        .mockReturnValue(
          mockData.announcements.filter(
            announcement => announcement.associationId === 'Um7at9Si8gVTEjuXsM8cdyOushc2',
          ),
        );
      const announcements = await announcementController.findByAssociationId(
        'Um7at9Si8gVTEjuXsM8cdyOushc2',
      );
      expect(announcements).toBeDefined();
      expect(Array.isArray(announcements)).toBe(true);
    });

    it('should return an empty array for an invalid associationId', async () => {
      announcementService.findByAssociationId = jest.fn().mockReturnValue([]);
      const announcements =
        await announcementController.findByAssociationId('invalidAssociationId');
      expect(announcements).toBeDefined();
      expect(Array.isArray(announcements)).toBe(true);
      expect(announcements.length).toBe(0);
    });
  });

  describe('create', () => {
    it('should create an announcement', async () => {
      const announcement: CreateAnnouncementDto = {
        associationId: 'Um7at9Si8gVTEjuXsM8cdyOushc2',
        description: 'Test description',
        datePublication: '2021-09-01',
        dateEvent: '2021-09-10',
        hoursEvent: '10:00 - 12:00',
        nameEvent: 'Test event',
        tags: ['test'],
        associationName: 'Test association',
        status: AnnouncementStatus.INACTIVE,
        maxParticipants: 10,
        maxVolunteers: 5,
      };
      announcementService.create = jest.fn().mockReturnValue({
        ...announcement,
        _id: new ObjectId(),
      });
      const createdAnnouncement = await announcementController.create(announcement);
      expect(createdAnnouncement).toBeDefined();
    });
  });

  describe('volunteer', () => {
    it('should register a volunteer', async () => {
      const announcementId = '67a89edbafdcf40d022aac89';
      const volunteer: InfoVolunteerDto = {
        id: 'Um7at9Si8gVTEjuXsM8cdyOushc2',
        name: 'Test volunteer',
      };
      announcementService.removeVolunteerWaiting = jest.fn().mockReturnValue({
        ...mockData.announcements[0],
        volunteersWaiting: [],
      });
      announcementService.registerVolunteer = jest.fn().mockReturnValue({
        ...mockData.announcements[0],
        volunteers: [volunteer],
      });
      const result = await announcementController.addVolunteer(announcementId, volunteer);
      expect(result).toBeDefined();
    });

    it('should register a volunteer waiting', async () => {
      const announcementId = '67a89edbafdcf40d022aac89';
      const volunteer: InfoVolunteerDto = {
        id: 'Um7at9Si8gVTEjuXsM8cdyOushc2',
        name: 'Test volunteer',
      };
      announcementService.registerVolunteerWaiting = jest.fn().mockReturnValue({
        id: '67a89edbafdcf40d022aac89',
        name: 'Test announcement',
      });
      const result = await announcementController.addVolunteerWaiting(announcementId, volunteer);
      expect(result).toBeDefined();
    });

    it('should remove a volunteer', async () => {
      const announcementId = '67a89edbafdcf40d022aac89';
      const volunteerId = 'Um7at9Si8gVTEjuXsM8cdyOushc2';

      announcementService.removeVolunteer = jest.fn().mockReturnValue(volunteerId);
      const result = await announcementController.removeVolunteer(announcementId, volunteerId);
      expect(result).toBeDefined();
      expect(result).toBe(volunteerId);
    });

    it('should remove a volunteer waiting', async () => {
      const announcementId = '67a89edbafdcf40d022aac89';
      const volunteerId = 'Um7at9Si8gVTEjuXsM8cdyOushc2';

      announcementService.removeVolunteerWaiting = jest.fn().mockReturnValue(volunteerId);
      const result = await announcementController.removeVolunteerWaiting(
        announcementId,
        volunteerId,
      );
      expect(result).toBeDefined();
      expect(result).toBe(volunteerId);
    });
  });

  describe('participant', () => {
    it('should register a participant', async () => {
      const announcementId = '67a89edbafdcf40d022aac89';
      const participant: InfoVolunteerDto = {
        id: 'Um7at9Si8gVTEjuXsM8cdyOushc2',
        name: 'Test participant',
      };
      announcementService.registerParticipant = jest.fn().mockReturnValue(participant);
      const result = await announcementController.addParticipant(announcementId, participant);
      expect(result).toBeDefined();
    });

    it('should remove a participant', async () => {
      const announcementId = '67a89edbafdcf40d022aac89';
      const participantId = 'Um7at9Si8gVTEjuXsM8cdyOushc2';

      announcementService.removeParticipant = jest.fn().mockReturnValue(participantId);
      const result = await announcementController.removeParticipant(announcementId, participantId);
      expect(result).toBeDefined();
      expect(result).toBe(participantId);
    });
  });

  describe('delete', () => {
    it('should delete an announcement', async () => {
      const announcementId = 'test-id';
      announcementService.delete = jest.fn().mockReturnValue(undefined);
      const result = await announcementController.delete(announcementId);
      expect(result).toBeUndefined();
    });
  });

  describe('deleteByAssociationId', () => {
    it('should delete announcements by associationId', async () => {
      const associationId = 'assoc-id';
      announcementService.deleteByAssociationId = jest.fn().mockReturnValue(undefined);
      const result = await announcementController.deleteByAssociationId(associationId);
      expect(result).toBeUndefined();
    });
  });

  describe('update', () => {
    it('should update an announcement', async () => {
      const announcementId = '67a89edbafdcf40d022aac89';
      const announcement = {
        associationId: 'Um7at9Si8gVTEjuXsM8cdyOushc2',
        description: "Test description d'une manifestation",
        associationName: 'Test association',
        status: AnnouncementStatus.INACTIVE,
        maxParticipants: 10,
        maxVolunteers: 5,
      };
      announcementService.update = jest.fn().mockReturnValue({
        ...announcement,
        _id: new ObjectId(announcementId),
      });
      const result = await announcementController.update(announcementId, announcement);
      expect(result).toBeDefined();
      expect(result.associationId).toBe(announcement.associationId);
    });
  });

  describe('updateStatus', () => {
    it('should update an announcement status', async () => {
      const announcementId = '67a89edbafdcf40d022aac89';
      const status = AnnouncementStatus.ACTIVE;
      announcementService.updateStatus = jest.fn().mockReturnValue({
        ...mockData.announcements[0],
        status,
      });
      const result = await announcementController.updateStatus(announcementId, status);
      expect(result).toBeDefined();
      expect(result.status).toBe(status);
    });
  });

  describe('filterAnnouncementsAggregation', () => {
    it('should return filtered announcements', async () => {
      const filterDto: FilterAnnouncementDto = {
        nameEvent: 'Event',
      };

      const mockResponse = {
        annonces: mockData.announcements,
        meta: {
          page: 1,
          limit: 10,
          total: mockData.announcements.length,
          pages: 1,
        },
      };

      announcementService.filterAnnouncementsAggregation = jest
        .fn()
        .mockResolvedValue(mockResponse);

      const result = await announcementController.filterAnnouncementsAggregation(filterDto);

      expect(result).toBeDefined();
      expect(result.annonces).toEqual(mockData.announcements);
      expect(result.meta).toBeDefined();
      expect(result.meta.page).toBe(1);
      expect(announcementService.filterAnnouncementsAggregation).toHaveBeenCalledWith(filterDto);
    });

    it('should handle errors when filtering announcements', async () => {
      const filterDto: FilterAnnouncementDto = {
        nameEvent: 'Event',
      };

      const errorMessage = 'Error filtering announcements';
      announcementService.filterAnnouncementsAggregation = jest
        .fn()
        .mockRejectedValue(new Error(errorMessage));

      const result = await announcementController.filterAnnouncementsAggregation(filterDto);

      expect(result).toEqual({
        annonces: [],
        meta: {
          total: 0,
          page: 1,
          limit: 10,
        },
      });
      expect(announcementService.filterAnnouncementsAggregation).toHaveBeenCalledWith(filterDto);
    });
  });

  describe('filterAnnouncementsByAssociation', () => {
    it('should return filtered announcements for association', async () => {
      const filterDto = {
        associationId: 'assoc-123',
        nameEvent: 'Test Event',
        status: 'ACTIVE',
        page: 1,
        limit: 10,
      };

      const mockResponse = {
        annonces: mockData.announcements,
        meta: { page: 1, limit: 10, total: mockData.announcements.length, pages: 1 },
      };

      announcementService.filterAssociationAnnouncements = jest
        .fn()
        .mockResolvedValue(mockResponse);

      const result = await announcementController.filterAnnouncementsByAssociation(filterDto);

      expect(result).toBeDefined();
      expect(result.annonces).toEqual(mockData.announcements);
      expect(result.meta).toBeDefined();
      expect(announcementService.filterAssociationAnnouncements).toHaveBeenCalledWith(filterDto);
    });

    it('should handle errors when filtering announcements by association', async () => {
      const filterDto = {
        associationId: 'assoc-123',
        nameEvent: 'Test Event',
      };

      const errorMessage = 'Error filtering announcements by association';
      announcementService.filterAssociationAnnouncements = jest
        .fn()
        .mockRejectedValue(new Error(errorMessage));

      await expect(
        announcementController.filterAnnouncementsByAssociation(filterDto),
      ).rejects.toThrow();
      expect(announcementService.filterAssociationAnnouncements).toHaveBeenCalledWith(filterDto);
    });
  });

  describe('findVolunteerInVolunteersByVolunteerId', () => {
    it('should return announcements where volunteer is registered', async () => {
      const volunteerId = 'vol-123';
      const mockAnnouncements = [
        { _id: '1', volunteers: [{ id: volunteerId }], nameEvent: 'Event 1' },
        { _id: '2', volunteersWaiting: [{ id: volunteerId }], nameEvent: 'Event 2' },
      ];

      announcementService.findVolunteerInAnnouncementByVolunteerId = jest
        .fn()
        .mockReturnValue(mockAnnouncements);

      const announcements =
        await announcementController.findVolunteerInVolunteersByVolunteerId(volunteerId);

      expect(announcements).toBeDefined();
      expect(Array.isArray(announcements)).toBe(true);
      expect(announcements.length).toBe(2);
      expect(announcementService.findVolunteerInAnnouncementByVolunteerId).toHaveBeenCalledWith(
        volunteerId,
      );
    });

    it('should return empty array when volunteer not found', async () => {
      const volunteerId = 'vol-456';

      announcementService.findVolunteerInAnnouncementByVolunteerId = jest.fn().mockReturnValue([]);

      const announcements =
        await announcementController.findVolunteerInVolunteersByVolunteerId(volunteerId);

      expect(announcements).toBeDefined();
      expect(Array.isArray(announcements)).toBe(true);
      expect(announcements.length).toBe(0);
      expect(announcementService.findVolunteerInAnnouncementByVolunteerId).toHaveBeenCalledWith(
        volunteerId,
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
          participants: [{ id: participantId }],
          nameEvent: 'Past Event 1',
        },
        {
          _id: '2',
          dateEvent: '2024-01-14',
          volunteers: [{ id: participantId }],
          nameEvent: 'Past Event 2',
        },
      ];

      announcementService.findPastAnnouncementsByParticipantId = jest
        .fn()
        .mockReturnValue(mockAnnouncements);

      const announcements =
        await announcementController.findPastAnnouncementsByParticipantId(participantId);

      expect(announcements).toBeDefined();
      expect(Array.isArray(announcements)).toBe(true);
      expect(announcements.length).toBe(2);
      expect(announcementService.findPastAnnouncementsByParticipantId).toHaveBeenCalledWith(
        participantId,
      );
    });

    it('should return empty array when no past announcements found', async () => {
      const participantId = 'part-456';

      announcementService.findPastAnnouncementsByParticipantId = jest.fn().mockReturnValue([]);

      const announcements =
        await announcementController.findPastAnnouncementsByParticipantId(participantId);

      expect(announcements).toBeDefined();
      expect(Array.isArray(announcements)).toBe(true);
      expect(announcements.length).toBe(0);
      expect(announcementService.findPastAnnouncementsByParticipantId).toHaveBeenCalledWith(
        participantId,
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
          participants: [{ id: participantId }],
          nameEvent: 'Future Event 1',
        },
        {
          _id: '2',
          dateEvent: '2024-02-16',
          participants: [{ id: participantId }],
          nameEvent: 'Future Event 2',
        },
      ];

      announcementService.findParticipantInParticipantsByParticipantId = jest
        .fn()
        .mockReturnValue(mockAnnouncements);

      const announcements =
        await announcementController.findParticipantInParticipantsByParticipantId(participantId);

      expect(announcements).toBeDefined();
      expect(Array.isArray(announcements)).toBe(true);
      expect(announcements.length).toBe(2);
      expect(announcementService.findParticipantInParticipantsByParticipantId).toHaveBeenCalledWith(
        participantId,
      );
    });

    it('should return empty array when no future announcements found', async () => {
      const participantId = 'part-456';

      announcementService.findParticipantInParticipantsByParticipantId = jest
        .fn()
        .mockReturnValue([]);

      const announcements =
        await announcementController.findParticipantInParticipantsByParticipantId(participantId);

      expect(announcements).toBeDefined();
      expect(Array.isArray(announcements)).toBe(true);
      expect(announcements.length).toBe(0);
      expect(announcementService.findParticipantInParticipantsByParticipantId).toHaveBeenCalledWith(
        participantId,
      );
    });
  });

  describe('addVolunteer', () => {
    it('should add volunteer to announcement', async () => {
      const announcementId = 'ann-123';
      const volunteer = { id: 'vol-123', name: 'John Doe' } as any;
      const expectedResult = { ...volunteer, added: true };

      announcementService.registerVolunteer = jest.fn().mockResolvedValue(expectedResult);

      const result = await announcementController.addVolunteer(announcementId, volunteer);

      expect(result).toEqual(expectedResult);
      expect(announcementService.registerVolunteer).toHaveBeenCalledWith(announcementId, volunteer);
    });

    it('should handle errors when adding volunteer', async () => {
      const announcementId = 'ann-123';
      const volunteer = { id: 'vol-123', name: 'John Doe' } as any;

      announcementService.registerVolunteer = jest
        .fn()
        .mockRejectedValue(new Error('Service error'));

      await expect(announcementController.addVolunteer(announcementId, volunteer)).rejects.toThrow(
        'Service error',
      );
    });
  });

  describe('addVolunteerWaiting', () => {
    it('should add volunteer to waiting list', async () => {
      const announcementId = 'ann-123';
      const volunteer = { id: 'vol-123', name: 'John Doe' } as any;
      const expectedResult = { ...volunteer, waiting: true };

      announcementService.registerVolunteerWaiting = jest.fn().mockResolvedValue(expectedResult);

      const result = await announcementController.addVolunteerWaiting(announcementId, volunteer);

      expect(result).toEqual(expectedResult);
      expect(announcementService.registerVolunteerWaiting).toHaveBeenCalledWith(
        announcementId,
        volunteer,
      );
    });

    it('should handle errors when adding volunteer to waiting list', async () => {
      const announcementId = 'ann-123';
      const volunteer = { id: 'vol-123', name: 'John Doe' } as any;

      announcementService.registerVolunteerWaiting = jest
        .fn()
        .mockRejectedValue(new Error('Service error'));

      await expect(
        announcementController.addVolunteerWaiting(announcementId, volunteer),
      ).rejects.toThrow('Service error');
    });
  });

  describe('addPresenceVolunteer', () => {
    it('should update volunteer presence', async () => {
      const announcementId = 'ann-123';
      const volunteer = { id: 'vol-123', name: 'John Doe' } as any;
      const expectedResult = { ...volunteer, isPresent: true };

      announcementService.updatePresentVolunteer = jest.fn().mockResolvedValue(expectedResult);

      const result = await announcementController.addPresenceVolunteer(announcementId, volunteer);

      expect(result).toEqual(expectedResult);
      expect(announcementService.updatePresentVolunteer).toHaveBeenCalledWith(
        volunteer,
        announcementId,
      );
    });

    it('should handle errors when updating volunteer presence', async () => {
      const announcementId = 'ann-123';
      const volunteer = { id: 'vol-123', name: 'John Doe' } as any;

      announcementService.updatePresentVolunteer = jest
        .fn()
        .mockRejectedValue(new Error('Service error'));

      await expect(
        announcementController.addPresenceVolunteer(announcementId, volunteer),
      ).rejects.toThrow('Service error');
    });
  });

  describe('addPresenceParticipant', () => {
    it('should update participant presence', async () => {
      const announcementId = 'ann-123';
      const participant = { id: 'part-123', name: 'John Doe' } as any;
      const expectedResult = { ...participant, isPresent: true };

      announcementService.updatePresentParticipant = jest.fn().mockResolvedValue(expectedResult);

      const result = await announcementController.addPresenceParticipant(
        announcementId,
        participant,
      );

      expect(result).toEqual(expectedResult);
      expect(announcementService.updatePresentParticipant).toHaveBeenCalledWith(
        participant,
        announcementId,
      );
    });

    it('should handle errors when updating participant presence', async () => {
      const announcementId = 'ann-123';
      const participant = { id: 'part-123', name: 'John Doe' } as any;

      announcementService.updatePresentParticipant = jest
        .fn()
        .mockRejectedValue(new Error('Service error'));

      await expect(
        announcementController.addPresenceParticipant(announcementId, participant),
      ).rejects.toThrow('Service error');
    });
  });

  describe('addParticipant', () => {
    it('should add participant to announcement', async () => {
      const announcementId = 'ann-123';
      const participant = { id: 'part-123', name: 'John Doe' } as any;
      const expectedResult = { ...participant, added: true };

      announcementService.registerParticipant = jest.fn().mockResolvedValue(expectedResult);

      const result = await announcementController.addParticipant(announcementId, participant);

      expect(result).toEqual(expectedResult);
      expect(announcementService.registerParticipant).toHaveBeenCalledWith(
        announcementId,
        participant,
      );
    });

    it('should handle errors when adding participant', async () => {
      const announcementId = 'ann-123';
      const participant = { id: 'part-123', name: 'John Doe' } as any;

      announcementService.registerParticipant = jest
        .fn()
        .mockRejectedValue(new Error('Service error'));

      await expect(
        announcementController.addParticipant(announcementId, participant),
      ).rejects.toThrow('Service error');
    });
  });

  describe('removeVolunteer', () => {
    it('should remove volunteer from announcement', async () => {
      const announcementId = 'ann-123';
      const volunteer = 'vol-123';
      const expectedResult = 'Volunteer removed successfully';

      announcementService.removeVolunteer = jest.fn().mockResolvedValue(expectedResult);

      const result = await announcementController.removeVolunteer(announcementId, volunteer);

      expect(result).toBe(expectedResult);
      expect(announcementService.removeVolunteer).toHaveBeenCalledWith(announcementId, volunteer);
    });

    it('should handle errors when removing volunteer', async () => {
      const announcementId = 'ann-123';
      const volunteer = 'vol-123';

      announcementService.removeVolunteer = jest.fn().mockRejectedValue(new Error('Service error'));

      await expect(
        announcementController.removeVolunteer(announcementId, volunteer),
      ).rejects.toThrow('Service error');
    });
  });

  describe('removeParticipant', () => {
    it('should remove participant from announcement', async () => {
      const announcementId = 'ann-123';
      const participant = 'part-123';
      const expectedResult = 'Participant removed successfully';

      announcementService.removeParticipant = jest.fn().mockResolvedValue(expectedResult);

      const result = await announcementController.removeParticipant(announcementId, participant);

      expect(result).toBe(expectedResult);
      expect(announcementService.removeParticipant).toHaveBeenCalledWith(
        announcementId,
        participant,
      );
    });

    it('should handle errors when removing participant', async () => {
      const announcementId = 'ann-123';
      const participant = 'part-123';

      announcementService.removeParticipant = jest
        .fn()
        .mockRejectedValue(new Error('Service error'));

      await expect(
        announcementController.removeParticipant(announcementId, participant),
      ).rejects.toThrow('Service error');
    });
  });

  describe('removeVolunteerWaiting', () => {
    it('should remove volunteer from waiting list', async () => {
      const announcementId = 'ann-123';
      const volunteer = 'vol-123';
      const expectedResult = 'Volunteer removed from waiting list';

      announcementService.removeVolunteerWaiting = jest.fn().mockResolvedValue(expectedResult);

      const result = await announcementController.removeVolunteerWaiting(announcementId, volunteer);

      expect(result).toBe(expectedResult);
      expect(announcementService.removeVolunteerWaiting).toHaveBeenCalledWith(
        announcementId,
        volunteer,
      );
    });

    it('should handle errors when removing volunteer from waiting list', async () => {
      const announcementId = 'ann-123';
      const volunteer = 'vol-123';

      announcementService.removeVolunteerWaiting = jest
        .fn()
        .mockRejectedValue(new Error('Service error'));

      await expect(
        announcementController.removeVolunteerWaiting(announcementId, volunteer),
      ).rejects.toThrow('Service error');
    });
  });

  describe('updateImageCoverAnnouncement', () => {
    it('should update announcement cover image', async () => {
      const id = 'ann-123';
      const file = {
        fieldname: 'file',
        originalname: 'test.jpg',
        mimetype: 'image/jpeg',
        size: 1024,
        buffer: Buffer.from('test'),
      } as any;
      const expectedResult = { id, announcementImage: 'new-image.jpg' } as any;

      announcementService.updateAvatar = jest.fn().mockResolvedValue(expectedResult);

      const result = await announcementController.updateImageCoverAnnouncement(id, file);

      expect(result).toEqual(expectedResult);
      expect(announcementService.updateAvatar).toHaveBeenCalledWith(id, file);
    });

    it('should handle errors when updating cover image', async () => {
      const id = 'ann-123';
      const file = {
        fieldname: 'file',
        originalname: 'test.jpg',
        mimetype: 'image/jpeg',
        size: 1024,
        buffer: Buffer.from('test'),
      } as any;

      announcementService.updateAvatar = jest.fn().mockRejectedValue(new Error('Service error'));

      await expect(announcementController.updateImageCoverAnnouncement(id, file)).rejects.toThrow(
        'Service error',
      );
    });
  });

  describe('updateStatus', () => {
    it('should update announcement status', async () => {
      const announcementId = 'ann-123';
      const status = 'COMPLETED' as AnnouncementStatus;
      const expectedResult = { _id: announcementId, status } as any;

      announcementService.updateStatus = jest.fn().mockResolvedValue(expectedResult);

      const result = await announcementController.updateStatus(announcementId, status);

      expect(result).toEqual(expectedResult);
      expect(announcementService.updateStatus).toHaveBeenCalledWith(announcementId, status);
    });

    it('should handle errors when updating status', async () => {
      const announcementId = 'ann-123';
      const status = 'COMPLETED' as AnnouncementStatus;

      announcementService.updateStatus = jest.fn().mockRejectedValue(new Error('Service error'));

      await expect(announcementController.updateStatus(announcementId, status)).rejects.toThrow(
        'Service error',
      );
    });
  });
});
