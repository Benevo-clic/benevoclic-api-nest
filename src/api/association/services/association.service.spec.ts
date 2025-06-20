import { Test, TestingModule } from '@nestjs/testing';
import { AssociationService } from './association.service';
import { AssociationRepository } from '../repository/association.repository';
import { Association } from '../entities/association.entity';
import { CreateAssociationDto } from '../dto/create-association.dto';
import { UpdateAssociationDto } from '../dto/update-association.dto';
import { FirebaseAdminService } from '../../../common/firebase/firebaseAdmin.service';

// Mock FirebaseAdminService
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

describe('AssociationService', () => {
  let associationService: AssociationService;
  let associationRepository: AssociationRepository;
  let firebaseAdmin;

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
  };

  beforeEach(async () => {
    // Reset all mocks before each test
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AssociationService,
        {
          provide: AssociationRepository,
          useValue: mockRepository,
        },
      ],
    }).compile();

    associationService = module.get<AssociationService>(AssociationService);
    associationRepository = module.get<AssociationRepository>(AssociationRepository);
    firebaseAdmin = FirebaseAdminService.getInstance();
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

      // Mock Firebase response
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

      // Mock Firebase response for non-existent email
      firebaseAdmin.getUserByEmail.mockResolvedValueOnce(null);

      await expect(associationService.create(createDto)).rejects.toThrow('Email not found');
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

      await expect(associationService.create(createDto)).rejects.toThrow('Email already exist');
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
      };

      mockRepository.findById.mockResolvedValue(mockAssociation);
      mockRepository.update.mockResolvedValue(undefined);
      mockRepository.findById.mockResolvedValue({ ...mockAssociation, ...updateDto });

      const result = await associationService.update('mockFirebaseUid123', updateDto);
      expect(result.bio).toBe(updateDto.bio);
      expect(associationRepository.update).toHaveBeenCalled();
    });

    it('should throw error if association not found', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(
        associationService.update('nonexistent', { bio: 'Updated Bio' }),
      ).rejects.toThrow('Association not found');
    });
  });

  describe('volunteer management', () => {
    const mockVolunteer = { id: 'vol123', name: 'John Doe' };

    describe('removeVolunteer', () => {
      it('should remove a volunteer from an association', async () => {
        mockRepository.findById.mockResolvedValue(mockAssociation);
        mockRepository.findAssociationsByVolunteer.mockResolvedValue([mockAssociation]);
        mockRepository.removeVolunteerFromAssociation.mockResolvedValue(mockVolunteer.id);

        const result = await associationService.removeVolunteer(
          'mockFirebaseUid123',
          mockVolunteer.id,
        );
        expect(result).toBe(mockVolunteer.id);
        expect(associationRepository.removeVolunteerFromAssociation).toHaveBeenCalled();
      });
    });

    describe('removeVolunteerWaiting', () => {
      it('should remove a volunteer from the waiting list of an association', async () => {
        mockRepository.findById.mockResolvedValue(mockAssociation);
        mockRepository.findAssociationsByVolunteerWaiting.mockResolvedValue([mockAssociation]);
        mockRepository.removeVolunteerWaitingFromAssociation.mockResolvedValue(mockVolunteer.id);

        const result = await associationService.removeVolunteerWaiting(
          'mockFirebaseUid123',
          mockVolunteer.id,
        );
        expect(result).toBe(mockVolunteer.id);
      });
    });

    describe('addVolunteer', () => {
      it('should add a volunteer to an association', async () => {
        mockRepository.findById.mockResolvedValue(mockAssociation);
        mockRepository.findAssociationsByVolunteer.mockResolvedValue([]);
        mockRepository.findAssociationsByVolunteerWaiting.mockResolvedValue(mockAssociation);
        mockRepository.update.mockResolvedValue(undefined);

        const result = await associationService.addVolunteer('mockFirebaseUid123', mockVolunteer);
        expect(result).toEqual(mockVolunteer);
      });

      it('should throw error if volunteer already exists', async () => {
        mockRepository.findAssociationsByVolunteer.mockResolvedValue([mockAssociation]);

        await expect(
          associationService.addVolunteer('mockFirebaseUid123', mockVolunteer),
        ).rejects.toThrow('Volunteer already exist');
      });
    });

    describe('addVolunteerWaiting', () => {
      it('should add a volunteer to the waiting list of an association', async () => {
        mockRepository.findById.mockResolvedValue(mockAssociation);
        mockRepository.findAssociationsByVolunteerWaiting.mockResolvedValue([]);
        mockRepository.update.mockResolvedValue(undefined);

        await associationService.addVolunteerWaiting('mockFirebaseUid123', mockVolunteer);
        expect(associationRepository.update).toHaveBeenCalled();
      });

      it('should throw error if volunteer already exists', async () => {
        mockRepository.findAssociationsByVolunteerWaiting.mockResolvedValue([mockAssociation]);

        await expect(
          associationService.addVolunteerWaiting('mockFirebaseUid123', mockVolunteer),
        ).rejects.toThrow('Volunteer already exist');
      });
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

      await expect(associationService.remove('nonexistent')).rejects.toThrow(
        'Association not found',
      );
    });
  });
});
