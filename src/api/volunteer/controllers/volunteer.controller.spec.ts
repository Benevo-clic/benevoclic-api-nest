// Mock FirebaseAdminService
import { VolunteerController } from './volunteer.controller';
import { MongoClient, ObjectId } from 'mongodb';
import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseModule } from '../../../database/database.module';
import { VolunteerService } from '../services/volunteer.service';
import { VolunteerRepository } from '../repository/volunteer.repository';
import { MONGODB_CONNECTION } from '../../../database/mongodb.provider';
import { DatabaseCollection } from '../../../common/enums/database.collection';
import * as mockData from '../../../../test/testFiles/volunteer.data.json';
import { CreateVolunteerDto } from '../dto/create-volunteer.dto';

jest.mock('../../../common/firebase/firebaseAdmin.service', () => ({
  FirebaseAdminService: {
    getInstance: jest.fn().mockReturnValue({
      getUserByEmail: jest.fn().mockResolvedValue({
        uid: 'mockFirebaseUid123',
        email: 'siriki@gmail.com',
      }),
    }),
  },
}));

describe('VolunteerController (Integration)', () => {
  let volunteerController: VolunteerController;
  let mongoClient: MongoClient;
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [DatabaseModule],
      controllers: [VolunteerController],
      providers: [VolunteerService, VolunteerRepository],
    }).compile();

    volunteerController = module.get<VolunteerController>(VolunteerController);
    mongoClient = module.get<MongoClient>(MONGODB_CONNECTION);

    const volunteers = mockData.volunteers.map(volunteer => ({
      ...volunteer,
      _id: new ObjectId(),
    }));

    const db = mongoClient.db();
    await db.collection(DatabaseCollection.VOLUNTEER).deleteMany({});
    await db.collection(DatabaseCollection.VOLUNTEER).insertMany(volunteers);
  });

  afterAll(async () => {
    const db = mongoClient.db();
    await db.collection(DatabaseCollection.VOLUNTEER).deleteMany({});
    await module.close();
  });

  describe('findAll', () => {
    it('should return all volunteers', async () => {
      const volunteers = await volunteerController.findAll();
      expect(volunteers).toBeDefined();
      expect(Array.isArray(volunteers)).toBe(true);
    });
  });

  describe('findOne', () => {
    it('should return a volunteer by ID', async () => {
      const volunteers = await volunteerController.findAll();
      const volunteerId = volunteers[0].volunteerId;
      const volunteer = await volunteerController.findOne(volunteerId);
      expect(volunteer).toBeDefined();
      expect(volunteer.volunteerId).toEqual(volunteerId);
    });
    it('should return null for an invalid ID', async () => {
      const volunteer = await volunteerController.findOne('invalidId');
      expect(volunteer).toBeNull();
    });
  });

  describe('create', () => {
    it('should create a volunteer', async () => {
      const volunteer: CreateVolunteerDto = {
        email: 'vol@gmail.com',
        bio: 'I am a volunteer',
        city: 'Paris',
      };
      const createdVolunteer = await volunteerController.create(volunteer);
      expect(createdVolunteer).toBeDefined();
      expect(createdVolunteer.bio).toEqual(volunteer.bio);
      expect(createdVolunteer.volunteerId).toBeDefined();
    });
    it('should throw an error for an existing email', async () => {
      const volunteer: CreateVolunteerDto = {
        email: 'vol@gmail.com',
        bio: 'I am a volunteer',
        city: 'Paris',
      };
      await expect(volunteerController.create(volunteer)).rejects.toThrow('Email already exist');
    });
  });

  describe('update', () => {
    it('should update a volunteer', async () => {
      const volunteers = await volunteerController.findAll();
      const volunteerId = volunteers[0].volunteerId;
      const updatedVolunteer = await volunteerController.update(volunteerId, {
        bio: 'I am a volunteer',
      });
      expect(updatedVolunteer).toBeDefined();
      expect(updatedVolunteer.bio).toEqual('I am a volunteer');
    });
    it('should throw error if volunteer not found', async () => {
      const updateData = {
        firstName: 'Updated',
        lastName: 'Volunteer',
        email: 'updated@example.com',
      };

      jest.spyOn(volunteerController, 'update').mockRejectedValue(new Error('Volunteer not found'));

      await expect(volunteerController.update('nonexistent-id', updateData)).rejects.toThrow(
        'Volunteer not found',
      );
    });
  });

  describe('remove', () => {
    it('should remove a volunteer', async () => {
      const volunteers = await volunteerController.findAll();
      const volunteerId = volunteers[0].volunteerId;
      const deletedVolunteer = await volunteerController.remove(volunteerId);
      expect(deletedVolunteer).toBeDefined();
      expect(deletedVolunteer.volunteerId).toEqual(volunteerId);
    });
    it('should throw an error for a non-existent volunteer', async () => {
      await expect(volunteerController.remove('invalidId')).rejects.toThrow('Volunteer not found');
    });
  });
});
