import { Test, TestingModule } from '@nestjs/testing';
import { AssociationService } from './association.service';
import { AssociationRepository } from '../repository/association.repository';
import { Association } from '../entities/association.entity';
import { CreateAssociationDto } from '../dto/create-association.dto';
import { UpdateAssociationDto } from '../dto/update-association.dto';
import { FirebaseAdminService } from '../../../common/firebase/firebaseAdmin.service';
import { BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { AnnouncementService } from '../../announcement/services/announcement.service';

jest.mock('../../../common/firebase/firebaseAdmin.service', () => {
  const mockFirebaseAdmin = {
    getUserByEmail: jest.fn(),
  };

  return {
    FirebaseAdminService: {
      getInstance: jest.fn().mockReturnValue(mockFirebaseAdmin),
    },
  };
});

jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});

describe('AssociationService', () => {
  let associationService: AssociationService;
  let associationRepository: AssociationRepository;
  let firebaseAdmin;
  let announcementService: AnnouncementService;

  const mockAssociation: Association = {
    associationId: 'mockFirebaseUid123',
    associationName: 'Test Association',
    phone: '0123456789',
    bio: 'Test Bio',
    city: 'Test City',
    type: 'Test Type',
    postalCode: '12345',
    country: 'Test Country',
    volunteers: [],
    volunteersWaiting: [],
  };

  const mockRepository = {
    create: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    findByEmail: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    findAssociationsByVolunteer: jest.fn(),
    findAssociationsByVolunteerWaiting: jest.fn(),
    removeVolunteerFromAssociation: jest.fn(),
    removeVolunteerWaitingFromAssociation: jest.fn(),
    findVolunteersInWaitingList: jest.fn(),
    findVolunteersList: jest.fn(),
    findAllAssociationsVolunteerFromWaitingList: jest.fn(),
    findAllAssociationsVolunteerFromList: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AssociationService,
        {
          provide: AssociationRepository,
          useValue: mockRepository,
        },
        {
          provide: AnnouncementService,
          useValue: {
            deleteByAssociationId: jest.fn().mockResolvedValue(undefined),
            updateAnnouncementAssociationName: jest.fn().mockResolvedValue(undefined),
          },
        },
      ],
    }).compile();

    associationService = module.get<AssociationService>(AssociationService);
    associationRepository = module.get<AssociationRepository>(AssociationRepository);
    firebaseAdmin = FirebaseAdminService.getInstance();
    announcementService = module.get<AnnouncementService>(AnnouncementService);
  });

  it('should be defined', () => {
    expect(associationService).toBeDefined();
  });

  describe('create', () => {
    it('should create a new association', async () => {
      const createDto: CreateAssociationDto = {
        email: 'test@example.com',
        phone: '0123456789',
        associationName: 'New Association',
        bio: 'New Bio',
        city: 'New City',
        type: 'New Type',
        postalCode: '54321',
        country: 'New Country',
      };

      firebaseAdmin.getUserByEmail.mockResolvedValueOnce({
        uid: 'mockFirebaseUid123',
        email: 'test@example.com',
      });

      mockRepository.findById.mockResolvedValue(null);
      mockRepository.findByEmail.mockResolvedValue(null);
      mockRepository.create.mockResolvedValue(mockAssociation);

      const result = await associationService.create(createDto);

      expect(firebaseAdmin.getUserByEmail).toHaveBeenCalledWith(createDto.email);
      expect(result).toEqual(mockAssociation);
      expect(associationRepository.create).toHaveBeenCalled();
    });

    it('should throw error if email not found in Firebase', async () => {
      const createDto: CreateAssociationDto = {
        email: 'nonexistent@example.com',
        phone: '0123456789',
        associationName: 'New Association',
        bio: 'New Bio',
        city: 'New City',
        type: 'New Type',
        postalCode: '54321',
        country: 'New Country',
      };

      firebaseAdmin.getUserByEmail.mockResolvedValueOnce(null);

      await expect(associationService.create(createDto)).rejects.toThrow(NotFoundException);
      expect(firebaseAdmin.getUserByEmail).toHaveBeenCalledWith(createDto.email);
      expect(associationRepository.create).not.toHaveBeenCalled();
    });

    it('should throw error if association already exists', async () => {
      const createDto: CreateAssociationDto = {
        email: 'test@example.com',
        phone: '0123456789',
        associationName: 'New Association',
        bio: 'New Bio',
        city: 'New City',
        type: 'New Type',
        postalCode: '54321',
        country: 'New Country',
      };

      // Mock Firebase response
      firebaseAdmin.getUserByEmail.mockResolvedValueOnce({
        uid: 'mockFirebaseUid123',
        email: 'test@example.com',
      });

      mockRepository.findById.mockResolvedValue(mockAssociation);

      await expect(associationService.create(createDto)).rejects.toThrow(BadRequestException);
      expect(firebaseAdmin.getUserByEmail).toHaveBeenCalledWith(createDto.email);
      expect(associationRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return all associations', async () => {
      const associations = [mockAssociation];
      mockRepository.findAll.mockResolvedValue(associations);

      const result = await associationService.findAll();
      expect(result).toEqual(associations);
    });
  });

  describe('findOne', () => {
    it('should return a single association', async () => {
      mockRepository.findById.mockResolvedValue(mockAssociation);

      const result = await associationService.findOne('mockFirebaseUid123');
      expect(result).toEqual(mockAssociation);
    });
  });

  describe('update', () => {
    it('should update an association', async () => {
      const updateDto: UpdateAssociationDto = {
        bio: 'Updated Bio',
        associationName: 'Updated Name',
      };

      const oldAssociation = { ...mockAssociation, associationName: 'Old Name' };

      mockRepository.findById
        .mockResolvedValueOnce(oldAssociation)
        .mockResolvedValueOnce({ ...mockAssociation, ...updateDto });
      mockRepository.update.mockResolvedValue(undefined);

      const result = await associationService.update('mockFirebaseUid123', updateDto);
      expect(result.bio).toBe(updateDto.bio);
      expect(associationRepository.update).toHaveBeenCalled();
      expect(announcementService.updateAnnouncementAssociationName).toHaveBeenCalledWith(
        'mockFirebaseUid123',
        'Updated Name',
      );
    });

    it('should not call updateAnnouncementAssociationName if associationName is not in updateDto', async () => {
      const updateDto: UpdateAssociationDto = {
        bio: 'Updated Bio',
      };

      const oldAssociation = { ...mockAssociation, associationName: 'Test Association' };

      mockRepository.findById
        .mockResolvedValueOnce(oldAssociation)
        .mockResolvedValueOnce({ ...mockAssociation, ...updateDto });
      mockRepository.update.mockResolvedValue(undefined);

      const result = await associationService.update('mockFirebaseUid123', updateDto);
      expect(result.bio).toBe(updateDto.bio);
      expect(associationRepository.update).toHaveBeenCalled();
      expect(announcementService.updateAnnouncementAssociationName).not.toHaveBeenCalled();
    });

    it('should throw error if association not found', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(
        associationService.update('nonexistent', { bio: 'Updated Bio' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('volunteer management', () => {
    const mockVolunteer = { volunteerId: 'vol123', volunteerName: 'John Doe' };

    describe('removeVolunteer', () => {
      it('should remove a volunteer from an association', async () => {
        const associationWithVolunteer = {
          ...mockAssociation,
          volunteers: [mockVolunteer],
        };
        mockRepository.findById.mockResolvedValue(associationWithVolunteer);
        mockRepository.removeVolunteerFromAssociation.mockResolvedValue(mockVolunteer.volunteerId);

        const result = await associationService.removeVolunteer(
          'mockFirebaseUid123',
          mockVolunteer.volunteerId,
        );
        expect(result).toBe(mockVolunteer.volunteerId);
        expect(associationRepository.removeVolunteerFromAssociation).toHaveBeenCalled();
      });

      it('should throw error if volunteer does not exist', async () => {
        const associationWithoutVolunteer = {
          ...mockAssociation,
          volunteers: [],
        };
        mockRepository.findById.mockResolvedValue(associationWithoutVolunteer);

        await expect(
          associationService.removeVolunteer('mockFirebaseUid123', mockVolunteer.volunteerId),
        ).rejects.toThrow(BadRequestException);
      });
    });

    describe('removeVolunteerWaiting', () => {
      it('should remove a volunteer from the waiting list of an association', async () => {
        const associationWithWaiting = {
          ...mockAssociation,
          volunteersWaiting: [mockVolunteer],
        };
        mockRepository.findById.mockResolvedValue(associationWithWaiting);
        mockRepository.removeVolunteerWaitingFromAssociation.mockResolvedValue(
          mockVolunteer.volunteerId,
        );

        const result = await associationService.removeVolunteerWaiting(
          'mockFirebaseUid123',
          mockVolunteer.volunteerId,
        );
        expect(result).toBe(mockVolunteer.volunteerId);
        expect(associationRepository.removeVolunteerWaitingFromAssociation).toHaveBeenCalled();
      });

      it('should throw error if volunteer does not exist in waiting list', async () => {
        const associationWithoutWaiting = {
          ...mockAssociation,
          volunteersWaiting: [],
        };
        mockRepository.findById.mockResolvedValue(associationWithoutWaiting);

        await expect(
          associationService.removeVolunteerWaiting(
            'mockFirebaseUid123',
            mockVolunteer.volunteerId,
          ),
        ).rejects.toThrow(BadRequestException);
      });
    });

    describe('addVolunteer', () => {
      it('should add a volunteer to an association', async () => {
        const associationWithoutVolunteer = {
          ...mockAssociation,
          volunteers: [],
        };
        mockRepository.findById.mockResolvedValue(associationWithoutVolunteer);
        mockRepository.update.mockResolvedValue(undefined);

        const result = await associationService.addVolunteer('mockFirebaseUid123', mockVolunteer);
        expect(result).toEqual(mockVolunteer);
        expect(associationRepository.update).toHaveBeenCalled();
      });

      it('should throw error if volunteer already exists', async () => {
        const associationWithVolunteer = {
          ...mockAssociation,
          volunteers: [mockVolunteer],
        };
        mockRepository.findById.mockResolvedValue(associationWithVolunteer);

        await expect(
          associationService.addVolunteer('mockFirebaseUid123', mockVolunteer),
        ).rejects.toThrow(BadRequestException);
      });
    });

    describe('addVolunteerWaiting', () => {
      it('should add a volunteer to the waiting list of an association', async () => {
        const associationWithoutWaiting = {
          ...mockAssociation,
          volunteersWaiting: [],
        };
        mockRepository.findById.mockResolvedValue(associationWithoutWaiting);
        mockRepository.update.mockResolvedValue(undefined);

        const result = await associationService.addVolunteerWaiting(
          'mockFirebaseUid123',
          mockVolunteer,
        );
        expect(result).toEqual(mockVolunteer);
        expect(associationRepository.update).toHaveBeenCalled();
      });

      it('should throw error if volunteer already exists', async () => {
        const associationWithWaiting = {
          ...mockAssociation,
          volunteersWaiting: [mockVolunteer],
        };
        mockRepository.findById.mockResolvedValue(associationWithWaiting);

        await expect(
          associationService.addVolunteerWaiting('mockFirebaseUid123', mockVolunteer),
        ).rejects.toThrow(BadRequestException);
      });
    });

    it('should allow a volunteer to be added to two different associations (service)', async () => {
      const associationId1 = 'assoc1';
      const associationId2 = 'assoc2';
      const volunteer = { volunteerId: 'multiAssocVolunteer', volunteerName: 'Jane Doe' };

      const assoc1 = {
        ...mockAssociation,
        associationId: associationId1,
        volunteers: [],
        volunteersWaiting: [volunteer],
      };
      mockRepository.findById.mockImplementation(id => {
        if (id === associationId1) return Promise.resolve(assoc1);
        if (id === associationId2) return Promise.resolve(assoc2);
        return Promise.resolve(null);
      });
      mockRepository.removeVolunteerWaitingFromAssociation.mockResolvedValue(undefined);
      mockRepository.update.mockResolvedValue(undefined);
      await associationService.removeVolunteerWaiting(associationId1, volunteer.volunteerId);
      assoc1.volunteersWaiting = [];
      await associationService.addVolunteer(associationId1, volunteer);
      assoc1.volunteers = [volunteer];

      const assoc2 = {
        ...mockAssociation,
        associationId: associationId2,
        volunteers: [],
        volunteersWaiting: [volunteer],
      };
      await associationService.removeVolunteerWaiting(associationId2, volunteer.volunteerId);
      assoc2.volunteersWaiting = [];
      await associationService.addVolunteer(associationId2, volunteer);
      assoc2.volunteers = [volunteer];

      expect(assoc1.volunteers).toContainEqual(
        expect.objectContaining({ volunteerId: volunteer.volunteerId }),
      );
      expect(assoc2.volunteers).toContainEqual(
        expect.objectContaining({ volunteerId: volunteer.volunteerId }),
      );
      expect(assoc1.volunteersWaiting).not.toContainEqual(
        expect.objectContaining({ volunteerId: volunteer.volunteerId }),
      );
      expect(assoc2.volunteersWaiting).not.toContainEqual(
        expect.objectContaining({ volunteerId: volunteer.volunteerId }),
      );
    });
  });

  describe('remove', () => {
    it('should remove an association', async () => {
      mockRepository.findById.mockResolvedValue(mockAssociation);
      mockRepository.remove.mockResolvedValue(undefined);

      const result = await associationService.remove('mockFirebaseUid123');
      expect(result).toContain('mockFirebaseUid123');
    });

    it('should throw error if association not found', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(associationService.remove('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getVolunteersInWaitingList', () => {
    it('should return the volunteer in the waiting list', async () => {
      mockRepository.findVolunteersInWaitingList.mockResolvedValue({ id: 'vol1', name: 'Jane' });
      const result = await associationService.getVolunteersInWaitingList('assoc1', 'vol1');
      expect(result).toEqual({ id: 'vol1', name: 'Jane' });
    });
    it('should return null if the volunteer is not in the waiting list', async () => {
      mockRepository.findVolunteersInWaitingList.mockResolvedValue(null);
      const result = await associationService.getVolunteersInWaitingList('assoc1', 'notFound');
      expect(result).toBeNull();
    });
  });

  describe('getAssociationsVolunteerList', () => {
    it('should return the volunteer in the active list', async () => {
      mockRepository.findVolunteersList.mockResolvedValue({ id: 'vol2', name: 'John' });
      const result = await associationService.getAssociationsVolunteerList('assoc2', 'vol2');
      expect(result).toEqual({ id: 'vol2', name: 'John' });
    });
    it('should return null if the volunteer is not in the active list', async () => {
      mockRepository.findVolunteersList.mockResolvedValue(null);
      const result = await associationService.getAssociationsVolunteerList('assoc2', 'notFound');
      expect(result).toBeNull();
    });
  });

  describe('getAllAssociationsVolunteerFromWaitingList', () => {
    it('should return all associations from repository for waiting list', async () => {
      const volunteerId = 'volunteer123';
      const expected = [{ associationId: 'asso1', associationName: 'Asso 1' }];
      jest
        .spyOn(associationRepository, 'findAllAssociationsVolunteerFromWaitingList')
        .mockResolvedValue(expected);

      const result =
        await associationService.getAllAssociationsVolunteerFromWaitingList(volunteerId);

      expect(result).toEqual(expected);
      expect(
        associationRepository.findAllAssociationsVolunteerFromWaitingList,
      ).toHaveBeenCalledWith(volunteerId);
    });
  });

  describe('getAllAssociationsVolunteerFromList', () => {
    it('should return all associations from repository for volunteers list', async () => {
      const volunteerId = 'volunteer456';
      const expected = [{ associationId: 'asso2', associationName: 'Asso 2' }];
      jest
        .spyOn(associationRepository, 'findAllAssociationsVolunteerFromList')
        .mockResolvedValue(expected);

      const result = await associationService.getAllAssociationsVolunteerFromList(volunteerId);

      expect(result).toEqual(expected);
      expect(associationRepository.findAllAssociationsVolunteerFromList).toHaveBeenCalledWith(
        volunteerId,
      );
    });
  });
});
