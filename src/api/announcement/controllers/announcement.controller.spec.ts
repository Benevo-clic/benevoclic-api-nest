import { AnnouncementController } from './announcement.controller';
import { MongoClient, ObjectId } from 'mongodb';
import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseModule } from '../../../database/database.module';
import { AnnouncementRepository } from '../repositories/announcement.repository';
import { AnnouncementService } from '../services/announcement.service';
import * as mockData from '../../../../test/testFiles/announcement.data.json';
import { DatabaseCollection } from '../../../common/enums/database.collection';
import { MONGODB_CONNECTION } from '../../../database/mongodb.provider';
import { CreateAnnouncementDto } from '../dto/create-announcement.dto';
import { AnnouncementStatus } from '../interfaces/announcement.interface';
import { InfoVolunteerDto } from '../../association/dto/info-volunteer.dto';

describe('AnnouncementController', () => {
  let announcementController: AnnouncementController;
  let announcementRepository: AnnouncementRepository;
  let announcementService: AnnouncementService;
  let mongoClient: MongoClient;
  let module: TestingModule;

  beforeAll(async () => {
    announcementRepository = <AnnouncementRepository>{};
    announcementRepository.removeVolunteerWaiting = jest.fn();
    announcementService = <AnnouncementService>{};
    announcementService.removeVolunteerWaiting = jest.fn();
    announcementService.registerVolunteer = jest.fn();
    announcementService.isVolunteer = jest.fn();
    announcementService.removeVolunteer = jest.fn();
    announcementService.findAll = jest.fn();
    announcementService.findById = jest.fn();
    announcementService.findByAssociationId = jest.fn();
    announcementService.create = jest.fn();
    announcementService.update = jest.fn();
    announcementService.delete = jest.fn();
    announcementService.deleteByAssociationId = jest.fn();
    announcementService.registerParticipant = jest.fn();
    announcementService.removeParticipant = jest.fn();
    announcementService.registerVolunteerWaiting = jest.fn();
    announcementService.updateStatus = jest.fn();

    module = await Test.createTestingModule({
      imports: [DatabaseModule],
      controllers: [AnnouncementController],
      providers: [AnnouncementRepository, AnnouncementService],
    })
      .overrideProvider(AnnouncementRepository)
      .useValue(announcementRepository)
      .overrideProvider(AnnouncementService)
      .useValue(announcementService)
      .compile();

    announcementController = module.get<AnnouncementController>(AnnouncementController);

    mongoClient = module.get<MongoClient>(MONGODB_CONNECTION);

    const announcements = mockData.announcements.map(announcement => ({
      ...announcement,
      _id: new ObjectId(),
    }));

    const db = mongoClient.db();
    await db.collection(DatabaseCollection.ANNOUNCEMENT).deleteMany({});
    await db.collection(DatabaseCollection.ANNOUNCEMENT).insertMany(announcements);
  });

  afterAll(async () => {
    const db = mongoClient.db();
    await db.collection(DatabaseCollection.ANNOUNCEMENT).deleteMany({});
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
      console.log(announcement);
      expect(announcement).toBeDefined();
      // expect(announcement.associationId).toBe(mockData.announcements[0].associationId);
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
      console.log(announcements.length);
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
      const createdAnnouncement = await announcementController.create([], announcement);
      expect(createdAnnouncement).toBeDefined();
      expect(createdAnnouncement.associationId).toBe(announcement.associationId);
      expect(createdAnnouncement.description).toBe(announcement.description);
      expect(createdAnnouncement.status).toBe(announcement.status);
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
      console.log(result);
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
      const announcementId = '67a89edbafdcf40d022aac89';
      announcementService.delete = jest.fn().mockReturnValue(true);
      const result = await announcementController.delete(announcementId);
      expect(result).toBeDefined();
      expect(result).toBe(true);
    });
  });

  describe('deleteByAssociationId', () => {
    it('should delete announcements by associationId', async () => {
      const associationId = 'Um7at9Si8gVTEjuXsM8cdyOushc2';
      announcementService.deleteByAssociationId = jest.fn().mockReturnValue(true);
      const result = await announcementController.deleteByAssociationId(associationId);
      expect(result).toBeDefined();
      expect(result).toBe(true);
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
});
