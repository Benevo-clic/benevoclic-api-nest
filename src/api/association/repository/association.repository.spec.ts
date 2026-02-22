import { Test, TestingModule } from '@nestjs/testing';
import { AssociationRepository } from './association.repository';
import { Association } from '../entities/association.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FindAssociationDto } from '../dto/find-association.dto';

describe('AssociationRepository', () => {
  let repository: AssociationRepository;
  let mockTypeOrmRepository: Partial<Repository<Association>>;
  let mockQueryBuilder: any;

  const mockAssociation: Association = {
    associationId: 'test123',
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

  beforeEach(async () => {
    mockQueryBuilder = {
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orWhere: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([mockAssociation]),
      getOne: jest.fn().mockResolvedValue(mockAssociation),
    };

    mockTypeOrmRepository = {
      find: jest.fn(),
      findOneBy: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
      createQueryBuilder: jest.fn(() => mockQueryBuilder),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AssociationRepository,
        {
          provide: getRepositoryToken(Association),
          useValue: mockTypeOrmRepository,
        },
      ],
    }).compile();

    repository = module.get<AssociationRepository>(AssociationRepository);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('findById', () => {
    it('should find an association by id', async () => {
      (mockTypeOrmRepository.findOneBy as jest.Mock).mockResolvedValue(mockAssociation);

      const result = await repository.findById('test123');

      expect(mockTypeOrmRepository.findOneBy).toHaveBeenCalledWith({ associationId: 'test123' });
      expect(result).toEqual(mockAssociation);
    });

    it('should return null if association not found', async () => {
      (mockTypeOrmRepository.findOneBy as jest.Mock).mockResolvedValue(null);

      const result = await repository.findById('nonexistent');

      expect(mockTypeOrmRepository.findOneBy).toHaveBeenCalledWith({
        associationId: 'nonexistent',
      });
      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create a new association', async () => {
      (mockTypeOrmRepository.create as jest.Mock).mockReturnValue(mockAssociation);
      (mockTypeOrmRepository.save as jest.Mock).mockResolvedValue(mockAssociation);

      const result = await repository.create(mockAssociation);

      expect(mockTypeOrmRepository.create).toHaveBeenCalledWith(mockAssociation);
      expect(mockTypeOrmRepository.save).toHaveBeenCalledWith(mockAssociation);
      expect(result).toEqual(mockAssociation);
    });
  });

  describe('findAll', () => {
    it('should return all associations', async () => {
      (mockTypeOrmRepository.find as jest.Mock).mockResolvedValue([mockAssociation]);

      const result = await repository.findAll();

      expect(mockTypeOrmRepository.find).toHaveBeenCalled();
      expect(result).toEqual([mockAssociation]);
    });
  });

  describe('update', () => {
    it('should update an association', async () => {
      const updateData = { bio: 'Updated Bio' };
      (mockTypeOrmRepository.update as jest.Mock).mockResolvedValue({ affected: 1 });

      await repository.update('test123', updateData);

      expect(mockTypeOrmRepository.update).toHaveBeenCalledWith(
        { associationId: 'test123' },
        updateData,
      );
    });
  });

  describe('remove', () => {
    it('should remove an association', async () => {
      (mockTypeOrmRepository.delete as jest.Mock).mockResolvedValue({ affected: 1 });

      await repository.remove('test123');

      expect(mockTypeOrmRepository.delete).toHaveBeenCalledWith({ associationId: 'test123' });
    });
  });

  describe('volunteer management', () => {
    describe('findAssociationsByVolunteer', () => {
      it('should find associations by volunteer id', async () => {
        const result = await repository.findAssociationsByVolunteer('vol123');

        expect(mockTypeOrmRepository.createQueryBuilder).toHaveBeenCalledWith('association');
        expect(mockQueryBuilder.where).toHaveBeenCalled();
        expect(result).toEqual([mockAssociation]);
      });
    });

    describe('findAssociationsByVolunteerWaiting', () => {
      it('should find associations by waiting volunteer id', async () => {
        const result: FindAssociationDto[] =
          await repository.findAssociationsByVolunteerWaiting('vol123');

        expect(mockTypeOrmRepository.createQueryBuilder).toHaveBeenCalledWith('association');
        expect(mockQueryBuilder.where).toHaveBeenCalled();
        expect(result).toEqual([mockAssociation]);
      });
    });

    describe('removeVolunteerFromAssociation', () => {
      it('should remove a volunteer from an association', async () => {
        const association = { ...mockAssociation, volunteers: [{ volunteerId: 'vol123' }] } as any;
        (mockTypeOrmRepository.findOneBy as jest.Mock).mockResolvedValue(association);
        (mockTypeOrmRepository.save as jest.Mock).mockResolvedValue(association);

        const result = await repository.removeVolunteerFromAssociation('test123', 'vol123');
        expect(result).toBe('vol123');
        expect(mockTypeOrmRepository.save).toHaveBeenCalled();
      });
    });

    describe('removeVolunteerWaitingFromAssociation', () => {
      it('should remove a waiting volunteer from an association', async () => {
        const association = {
          ...mockAssociation,
          volunteersWaiting: [{ volunteerId: 'vol123' }],
        } as any;
        (mockTypeOrmRepository.findOneBy as jest.Mock).mockResolvedValue(association);
        (mockTypeOrmRepository.save as jest.Mock).mockResolvedValue(association);

        await repository.removeVolunteerWaitingFromAssociation('test123', 'vol123');
        expect(mockTypeOrmRepository.save).toHaveBeenCalled();
      });
    });

    describe('findVolunteersInWaitingList', () => {
      it('should return the volunteer in the waiting list', async () => {
        const association = {
          ...mockAssociation,
          volunteersWaiting: [{ volunteerId: 'vol1', volunteerName: 'Jane' }],
        };
        mockQueryBuilder.getOne.mockResolvedValue(association);

        const result = await repository.findVolunteersInWaitingList('test123', 'vol1');
        expect(result).toEqual({ volunteerId: 'vol1', volunteerName: 'Jane' });
      });

      it('should return null if the volunteer is not in the waiting list', async () => {
        mockQueryBuilder.getOne.mockResolvedValue(null);

        const result = await repository.findVolunteersInWaitingList('test123', 'notFound');
        expect(result).toBeNull();
      });
    });

    describe('findVolunteersList', () => {
      it('should return the volunteer in the active list', async () => {
        const association = {
          ...mockAssociation,
          volunteers: [{ volunteerId: 'vol2', volunteerName: 'John' }],
        };
        mockQueryBuilder.getOne.mockResolvedValue(association);

        const result = await repository.findVolunteersList('test123', 'vol2');
        expect(result).toEqual({ volunteerId: 'vol2', volunteerName: 'John' });
      });

      it('should return null if the volunteer is not in the active list', async () => {
        mockQueryBuilder.getOne.mockResolvedValue(null);

        const result = await repository.findVolunteersList('test123', 'notFound');
        expect(result).toBeNull();
      });
    });

    describe('findAllAssociationsVolunteerFromWaitingList', () => {
      it('should return associations where volunteer is in waiting list', async () => {
        const mockAssociations = [
          { associationId: 'asso1', associationName: 'Asso 1' },
          { associationId: 'asso2', associationName: 'Asso 2' },
        ];
        mockQueryBuilder.getMany.mockResolvedValue(mockAssociations);

        const result = await repository.findAllAssociationsVolunteerFromWaitingList('volunteer123');

        expect(mockTypeOrmRepository.createQueryBuilder).toHaveBeenCalledWith('association');
        expect(result).toEqual(mockAssociations);
      });
    });

    describe('findAllAssociationsVolunteerFromList', () => {
      it('should return associations where volunteer is in volunteers list', async () => {
        const mockAssociations = [{ associationId: 'asso3', associationName: 'Asso 3' }];
        mockQueryBuilder.getMany.mockResolvedValue(mockAssociations);

        const result = await repository.findAllAssociationsVolunteerFromList('volunteer456');

        expect(mockTypeOrmRepository.createQueryBuilder).toHaveBeenCalledWith('association');
        expect(result).toEqual(mockAssociations);
      });
    });
  });
});
