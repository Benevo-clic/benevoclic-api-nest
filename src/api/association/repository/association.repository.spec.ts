import { Test, TestingModule } from '@nestjs/testing';
import { AssociationRepository } from './association.repository';
import { Collection, ObjectId } from 'mongodb';
import { MONGODB_CONNECTION } from '../../../database/mongodb.provider';
import { Association } from '../entities/association.entity';
import { DatabaseCollection } from '../../../common/enums/database.collection';

describe('AssociationRepository', () => {
  let repository: AssociationRepository;
  let collection: Collection<Association>;
  let module: TestingModule;

  const mockAssociation: Association = {
    associationId: 'test123',
    associationName: 'Test Association',
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

        expect(collection.find).toHaveBeenCalledWith({ 'volunteers.id': 'vol123' });
        expect(result).toEqual([mockAssociation]);
      });
    });

    describe('findAssociationsByVolunteerWaiting', () => {
      it('should find associations by waiting volunteer id', async () => {
        const mockFind = {
          toArray: jest.fn().mockResolvedValue([mockAssociation]),
        };
        jest.spyOn(collection, 'find').mockReturnValue(mockFind as any);

        const result = await repository.findAssociationsByVolunteerWaiting('vol123');

        expect(collection.find).toHaveBeenCalledWith({ 'volunteersWaiting.id': 'vol123' });
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
  });
});
