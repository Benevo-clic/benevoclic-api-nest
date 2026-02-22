import { Test, TestingModule } from '@nestjs/testing';
import { AssociationController } from './association.controller';
import { AssociationService } from '../services/association.service';
import { AnnouncementService } from '../../announcement/services/announcement.service';
import { NotFoundException } from '@nestjs/common';
import * as mockData from '../../../../test/testFiles/association.data.json';

jest.mock('../../../common/firebase/firebaseAdmin.service', () => ({
  FirebaseAdminService: {
    getInstance: jest.fn().mockReturnValue({
      getUserByEmail: jest.fn().mockResolvedValue({
        uid: 'mockFirebaseUid123',
        email: 'abou@gmail.com',
      }),
    }),
  },
}));

describe('AssociationController', () => {
  let controller: AssociationController;

  const mockAssociationService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    addVolunteerWaiting: jest.fn(),
    registerVolunteer: jest.fn(),
    getAssociationWaitingByVolunteer: jest.fn(),
    getAssociationByVolunteer: jest.fn(),
    removeVolunteerWaiting: jest.fn(),
    removeVolunteer: jest.fn(),
    getVolunteersInWaitingList: jest.fn(),
    getAssociationsVolunteerList: jest.fn(),
    getAllAssociationsVolunteerFromWaitingList: jest.fn(),
    getAllAssociationsVolunteerFromList: jest.fn(),
    getNumberOfAssociations: jest.fn(),
  };

  const mockAnnouncementService = {
    deleteByAssociationId: jest.fn().mockResolvedValue(undefined),
    updateAnnouncementAssociationName: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AssociationController],
      providers: [
        {
          provide: AssociationService,
          useValue: mockAssociationService,
        },
        {
          provide: AnnouncementService,
          useValue: mockAnnouncementService,
        },
      ],
    }).compile();

    controller = module.get<AssociationController>(AssociationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all associations', async () => {
      mockAssociationService.findAll.mockResolvedValue(mockData.associations);
      const associations = await controller.findAll();
      expect(associations).toBeDefined();
      expect(Array.isArray(associations)).toBe(true);
      expect(associations.length).toBe(mockData.associations.length);
    });
  });

  describe('findOne', () => {
    it('should return a single association', async () => {
      mockAssociationService.findOne.mockResolvedValue(mockData.associations[0]);
      const found = await controller.findOne(mockData.associations[0].associationId);

      expect(found).toBeDefined();
      expect(found).not.toBeNull();
      expect(found.associationName).toBe(mockData.associations[0].associationName);
    });

    it('should throw NotFoundException for non-existent association', async () => {
      mockAssociationService.findOne.mockRejectedValue(new NotFoundException());
      await expect(controller.findOne('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a new association', async () => {
      const newAssociation = {
        email: 'abou@gmail.com',
        phone: '0756124578',
        associationName: 'Médecins Sans Frontières',
        bio: 'Organisation médicale humanitaire internationale',
        city: 'Paris',
        type: 'Santé',
        postalCode: '75002',
        country: 'France',
      };

      const expectedResult = {
        associationId: 'mockFirebaseUid123',
        ...newAssociation,
        volunteers: [],
        volunteersWaiting: [],
      };

      mockAssociationService.create.mockResolvedValue(expectedResult);

      const created = await controller.create(newAssociation);
      expect(created).toBeDefined();
      expect(created).toMatchObject(expectedResult);
    });
  });

  describe('update', () => {
    it('should update an existing association', async () => {
      const updateDto = {
        bio: 'Nouvelle description',
      };
      const updatedAssoc = { ...mockData.associations[0], ...updateDto };
      mockAssociationService.update.mockResolvedValue(updatedAssoc);

      const updated = await controller.update(mockData.associations[0].associationId, updateDto);
      expect(updated).toBeDefined();
      expect(updated.bio).toBe(updateDto.bio);
    });
  });

  describe('addVolunteer', () => {
    it('should add a volunteer to waiting list', async () => {
      const associationId = 'assoc1';
      const volunteer = { volunteerId: 'vol1', volunteerName: 'John' };
      const updatedAssoc = { ...mockData.associations[0], volunteersWaiting: [volunteer] };
      mockAssociationService.addVolunteerWaiting.mockResolvedValue(updatedAssoc);

      const result = await controller.addAssociationVolunteersWaiting(associationId, volunteer);
      expect(result).toEqual(updatedAssoc);
    });

    it('should add a volunteer to active list', async () => {
      const associationId = 'assoc1';
      const volunteer = { volunteerId: 'vol1', volunteerName: 'John' };
      mockAssociationService.registerVolunteer.mockResolvedValue(volunteer);

      const result = await controller.addAssociationVolunteers(associationId, volunteer);
      expect(result).toEqual(volunteer);
    });
  });

  describe('getAssociationWaitingByVolunteer', () => {
    it('should return associations waiting for a volunteer', async () => {
      const volunteerId = 'vol1';
      const associations = [mockData.associations[0]];
      mockAssociationService.getAssociationWaitingByVolunteer.mockResolvedValue(associations);

      const result = await controller.getAssociationWaiting(volunteerId);
      expect(result).toEqual(associations);
    });
  });

  describe('getAssociationByVolunteer', () => {
    it('should return associations for a volunteer', async () => {
      const volunteerId = 'vol1';
      const associations = [mockData.associations[0]];
      mockAssociationService.getAssociationByVolunteer.mockResolvedValue(associations);

      const result = await controller.getAssociation(volunteerId);
      expect(result).toEqual(associations);
    });
  });

  describe('removeVolunteerWaiting', () => {
    it('should remove a volunteer from the waiting list', async () => {
      const associationId = 'assoc1';
      const volunteerId = 'vol1';
      mockAssociationService.removeVolunteerWaiting.mockResolvedValue(undefined);

      await controller.removeAssociationVolunteersWaiting(associationId, volunteerId);
      expect(mockAssociationService.removeVolunteerWaiting).toHaveBeenCalledWith(
        associationId,
        volunteerId,
      );
    });
  });

  describe('removeVolunteer', () => {
    it('should remove a volunteer from an association', async () => {
      const associationId = 'assoc1';
      const volunteerId = 'vol1';
      mockAssociationService.removeVolunteer.mockResolvedValue(volunteerId);

      const result = await controller.removeAssociationVolunteers(associationId, volunteerId);
      expect(result).toBe(volunteerId);
    });
  });

  describe('remove', () => {
    it('should remove an association', async () => {
      const associationId = 'assoc1';
      mockAssociationService.remove.mockResolvedValue({ associationId });

      const result = await controller.remove(associationId);
      expect(result).toEqual({ associationId });
    });
  });

  describe('getAssociationsWaitingList', () => {
    it('should return volunteer in waiting list', async () => {
      const associationId = 'assoc1';
      const volunteerId = 'vol1';
      const volunteer = { volunteerId, volunteerName: 'John' };
      mockAssociationService.getVolunteersInWaitingList.mockResolvedValue(volunteer);

      const result = await controller.getAssociationsWaitingList(associationId, volunteerId);
      expect(result).toEqual(volunteer);
    });
  });

  describe('getAssociationsVolunteerList', () => {
    it('should return volunteer in active list', async () => {
      const associationId = 'assoc1';
      const volunteerId = 'vol1';
      const volunteer = { volunteerId, volunteerName: 'John' };
      mockAssociationService.getAssociationsVolunteerList.mockResolvedValue(volunteer);

      const result = await controller.getAssociationsVolunteerList(associationId, volunteerId);
      expect(result).toEqual(volunteer);
    });
  });

  describe('getAllAssociationsVolunteerFromWaitingList', () => {
    it('should return all associations where the volunteer is in the waiting list', async () => {
      const volunteerId = 'volunteer123';
      const expectedAssociations = [{ associationId: 'asso1', associationName: 'Asso 1' }];
      mockAssociationService.getAllAssociationsVolunteerFromWaitingList.mockResolvedValue(
        expectedAssociations,
      );

      const result = await controller.getAllAssociationsVolunteerFromWaitingList(volunteerId);

      expect(result).toEqual(expectedAssociations);
    });
  });

  describe('getAssociationVolunteersList', () => {
    it('should return all associations where the volunteer is in the volunteers list', async () => {
      const volunteerId = 'volunteer456';
      const expectedAssociations = [{ associationId: 'asso3', associationName: 'Asso 3' }];
      mockAssociationService.getAllAssociationsVolunteerFromList.mockResolvedValue(
        expectedAssociations,
      );

      const result = await controller.getAssociationVolunteersList(volunteerId);

      expect(result).toEqual(expectedAssociations);
    });
  });
});
