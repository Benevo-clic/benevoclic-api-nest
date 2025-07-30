import { Test, TestingModule } from '@nestjs/testing';
import { AssociationRepository } from './association.repository';
import { Collection, ObjectId } from 'mongodb';
import { MONGODB_CONNECTION } from '../../../database/mongodb.provider';
import { Association } from '../entities/association.entity';
import { DatabaseCollection } from '../../../common/enums/database.collection';
import { FindAssociationDto } from '../dto/find-association.dto';

describe('AssociationRepository', () => {
  let repository: AssociationRepository;
  let collection: Collection<Association>;
  let module: TestingModule;

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

  const mockMongoClient = {
    db: jest.fn().mockReturnValue({
      collection: jest.fn().mockReturnValue({
        findOne: jest.fn(),
        find: jest.fn(),
        insertOne: jest.fn(),
        updateOne: jest.fn(),
        deleteOne: jest.fn(),
      }),
    }),
  };

  beforeAll(async () => {
    module = await Test.createTestingModule({
      providers: [
        AssociationRepository,
        {
          provide: MONGODB_CONNECTION,
          useValue: mockMongoClient,
        },
      ],
    }).compile();

    repository = module.get<AssociationRepository>(AssociationRepository);
    collection = mockMongoClient.db().collection(DatabaseCollection.ASSOCIATION);
  });

  afterAll(async () => {
    await module.close();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findById', () => {
    it('should find an association by id', async () => {
      jest.spyOn(collection, 'findOne').mockResolvedValue(mockAssociation);

      const result = await repository.findById('test123');

      expect(collection.findOne).toHaveBeenCalledWith({ associationId: 'test123' });
      expect(result).toEqual(mockAssociation);
    });

    it('should return null if association not found', async () => {
      jest.spyOn(collection, 'findOne').mockResolvedValue(null);

      const result = await repository.findById('nonexistent');

      expect(collection.findOne).toHaveBeenCalledWith({ associationId: 'nonexistent' });
      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create a new association', async () => {
      const objectId = new ObjectId();
      jest
        .spyOn(collection, 'insertOne')
        .mockResolvedValue({ insertedId: objectId, acknowledged: true });

      const result = await repository.create(mockAssociation);

      expect(collection.insertOne).toHaveBeenCalledWith(mockAssociation);
      expect(result).toEqual(mockAssociation);
    });
  });

  describe('findAll', () => {
    it('should return all associations', async () => {
      const mockFind = {
        toArray: jest.fn().mockResolvedValue([mockAssociation]),
      };
      jest.spyOn(collection, 'find').mockReturnValue(mockFind as any);

      const result = await repository.findAll();

      expect(collection.find).toHaveBeenCalled();
      expect(result).toEqual([mockAssociation]);
    });
  });

  describe('update', () => {
    it('should update an association', async () => {
      const updateData = { bio: 'Updated Bio' };
      jest.spyOn(collection, 'updateOne').mockResolvedValue({
        matchedCount: 1,
        modifiedCount: 1,
        upsertedCount: 0,
        upsertedId: null,
        acknowledged: true,
      });

      await repository.update('test123', updateData);

      expect(collection.updateOne).toHaveBeenCalledWith(
        { associationId: 'test123' },
        { $set: updateData },
      );
    });
  });

  describe('remove', () => {
    it('should remove an association', async () => {
      jest
        .spyOn(collection, 'deleteOne')
        .mockResolvedValue({ deletedCount: 1, acknowledged: true });

      await repository.remove('test123');

      expect(collection.deleteOne).toHaveBeenCalledWith({ associationId: 'test123' });
    });
  });

  describe('volunteer management', () => {
    describe('findAssociationsByVolunteer', () => {
      it('should find associations by volunteer id', async () => {
        const mockFind = {
          toArray: jest.fn().mockResolvedValue([mockAssociation]),
        };
        jest.spyOn(collection, 'find').mockReturnValue(mockFind as any);

        const result = await repository.findAssociationsByVolunteer('vol123');

        expect(collection.find).toHaveBeenCalledWith({ 'volunteers.volunteerId': 'vol123' });
        expect(result).toEqual([mockAssociation]);
      });
    });

    describe('findAssociationsByVolunteerWaiting', () => {
      it('should find associations by waiting volunteer id', async () => {
        const mockFind = {
          toArray: jest.fn().mockResolvedValue([mockAssociation]),
        };
        jest.spyOn(collection, 'find').mockReturnValue(mockFind as any);

        const result: FindAssociationDto[] =
          await repository.findAssociationsByVolunteerWaiting('vol123');

        expect(collection.find).toHaveBeenCalledWith({ 'volunteersWaiting.volunteerId': 'vol123' });
        expect(result).toEqual([mockAssociation]);
      });
    });

    describe('removeVolunteerFromAssociation', () => {
      it('should remove a volunteer from an association', async () => {
        jest.spyOn(collection, 'updateOne').mockResolvedValue({
          matchedCount: 1,
          modifiedCount: 1,
          upsertedCount: 0,
          upsertedId: null,
          acknowledged: true,
        });

        const result = await repository.removeVolunteerFromAssociation('test123', 'vol123');
        expect(result).toBe('vol123');
      });
    });

    describe('removeVolunteerWaitingFromAssociation', () => {
      it('should remove a waiting volunteer from an association', async () => {
        jest.spyOn(collection, 'updateOne').mockResolvedValue({
          matchedCount: 1,
          modifiedCount: 1,
          upsertedCount: 0,
          upsertedId: null,
          acknowledged: true,
        });

        await repository.removeVolunteerWaitingFromAssociation('test123', 'vol123');
      });
    });

    describe('findVolunteersInWaitingList', () => {
      it('should return the volunteer in the waiting list', async () => {
        const association = {
          ...mockAssociation,
          volunteersWaiting: [{ volunteerId: 'vol1', volunteerName: 'Jane' }],
        };
        jest.spyOn(collection, 'findOne').mockResolvedValue(association);
        const result = await repository.findVolunteersInWaitingList('test123', 'vol1');
        expect(result).toEqual({ volunteerId: 'vol1', volunteerName: 'Jane' });
      });
      it('should return null if the volunteer is not in the waiting list', async () => {
        jest.spyOn(collection, 'findOne').mockResolvedValue(null);
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
        jest.spyOn(collection, 'findOne').mockResolvedValue(association);
        const result = await repository.findVolunteersList('test123', 'vol2');
        expect(result).toEqual({ volunteerId: 'vol2', volunteerName: 'John' });
      });
      it('should return null if the volunteer is not in the active list', async () => {
        jest.spyOn(collection, 'findOne').mockResolvedValue(null);
        const result = await repository.findVolunteersList('test123', 'notFound');
        expect(result).toBeNull();
      });
    });

    describe('findAllAssociationsVolunteerFromWaitingList', () => {
      it('should return associations where volunteer is in waiting list', async () => {
        const repository = new AssociationRepository(mockMongoClient as any);
        const volunteerId = 'volunteer123';
        const mockAssociations = [
          { associationId: 'asso1', associationName: 'Asso 1' },
          { associationId: 'asso2', associationName: 'Asso 2' },
        ];
        const toArrayMock = jest.fn().mockResolvedValue(mockAssociations);
        const findMock = jest.fn().mockReturnValue({ toArray: toArrayMock });
        Object.defineProperty(repository, 'collection', { get: () => ({ find: findMock }) });

        const result = await repository.findAllAssociationsVolunteerFromWaitingList(volunteerId);

        expect(findMock).toHaveBeenCalledWith(
          { 'volunteersWaiting.volunteerId': volunteerId },
          { projection: { _id: 0, associationId: 1, associationName: 1 } },
        );
        expect(result).toEqual(mockAssociations);
      });
    });

    describe('findAllAssociationsVolunteerFromList', () => {
      it('should return associations where volunteer is in volunteers list', async () => {
        const repository = new AssociationRepository(mockMongoClient as any);
        const volunteerId = 'volunteer456';
        const mockAssociations = [{ associationId: 'asso3', associationName: 'Asso 3' }];
        const toArrayMock = jest.fn().mockResolvedValue(mockAssociations);
        const findMock = jest.fn().mockReturnValue({ toArray: toArrayMock });
        Object.defineProperty(repository, 'collection', { get: () => ({ find: findMock }) });

        const result = await repository.findAllAssociationsVolunteerFromList(volunteerId);

        expect(findMock).toHaveBeenCalledWith(
          { 'volunteers.volunteerId': volunteerId },
          { projection: { _id: 0, associationId: 1, associationName: 1 } },
        );
        expect(result).toEqual(mockAssociations);
      });
    });
  });
});
