import { Test, TestingModule } from '@nestjs/testing';
import { AnnouncementRepository } from './announcement.repository';
import { Collection, MongoClient, ObjectId } from 'mongodb';
import { Announcement } from '../entities/announcement.entity';
import { AnnouncementStatus } from '../interfaces/announcement.interface';
import { mockAnnouncements } from './__mocks__/announcement.mock';
import {
  associationNameFilterDto,
  basicFilterDto,
  dateFilterDto,
  geoFilterDto,
  hoursEventFilterDto,
  publicationIntervalFilterDto,
  statusFilterDto,
  tagFilterDto,
} from '../dto/__mocks__/filter-announcement.mock';
import { FilterAssociationAnnouncementDto } from '../dto/filter-association-announcement.dto';

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

jest.mock('mongodb', () => ({
  ...jest.requireActual('mongodb'),
  ObjectId: jest.fn().mockImplementation((id: string) => {
    if (id === 'invalid-id') {
      throw new Error('Invalid ObjectId');
    }
    return new (jest.requireActual('mongodb').ObjectId)(id);
  }),
}));

describe('AnnouncementRepository', () => {
  let repository: AnnouncementRepository;
  let mockCollection: jest.Mocked<Collection>;
  let mockMongoClient: jest.Mocked<MongoClient>;

  beforeEach(async () => {
    mockCollection = {
      find: jest.fn(),
      findOne: jest.fn(),
      insertOne: jest.fn(),
      updateOne: jest.fn(),
      deleteOne: jest.fn(),
      deleteMany: jest.fn(),
      updateMany: jest.fn(),
      aggregate: jest.fn(),
    } as any;

    mockMongoClient = {
      db: jest.fn().mockReturnValue({
        collection: jest.fn().mockReturnValue(mockCollection),
      }),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnnouncementRepository,
        {
          provide: 'MONGODB_CONNECTION',
          useValue: mockMongoClient,
        },
      ],
    }).compile();

    repository = module.get<AnnouncementRepository>(AnnouncementRepository);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('updateAssociationNameByAssociationId', () => {
    it('should update association name for all announcements', async () => {
      const associationId = 'assoc-123';
      const associationName = 'New Association Name';

      mockCollection.updateMany = jest.fn().mockResolvedValue({ modifiedCount: 5 });

      await repository.updateAssociationNameByAssociationId(associationId, associationName);

      expect(mockCollection.updateMany).toHaveBeenCalledWith(
        { associationId },
        { $set: { associationName } },
      );
    });
  });

  describe('removeVolunteerEverywhere', () => {
    it('should remove volunteer from all announcements', async () => {
      const volunteerId = 'vol-123';

      mockCollection.updateMany = jest.fn().mockResolvedValue({ modifiedCount: 3 });

      const result = await repository.removeVolunteerEverywhere(volunteerId);

      expect(result).toBe(3);
      expect(mockCollection.updateMany).toHaveBeenCalledWith({}, [
        {
          $set: {
            hadInVolunteers: { $in: [volunteerId, '$volunteers.id'] },
          },
        },
        {
          $set: {
            volunteers: {
              $filter: {
                input: '$volunteers',
                cond: { $ne: ['$$this.id', volunteerId] },
              },
            },
            volunteersWaiting: {
              $filter: {
                input: '$volunteersWaiting',
                cond: { $ne: ['$$this.id', volunteerId] },
              },
            },
          },
        },
        {
          $set: {
            nbVolunteers: {
              $cond: ['$hadInVolunteers', { $subtract: ['$nbVolunteers', 1] }, '$nbVolunteers'],
            },
          },
        },
        { $unset: 'hadInVolunteers' },
      ]);
    });
  });

  describe('removeVolunteerWaiting', () => {
    it('should remove volunteer from waiting list', async () => {
      const id = '507f1f77bcf86cd799439011';
      const volunteerId = 'vol-123';

      mockCollection.updateOne = jest.fn().mockResolvedValue({ modifiedCount: 1 });

      await repository.removeVolunteerWaiting(id, volunteerId);

      expect(mockCollection.updateOne).toHaveBeenCalledWith(
        { _id: new ObjectId(id) },
        { $pull: { volunteersWaiting: { id: volunteerId } } },
        undefined,
      );
    });

    it('should remove volunteer from waiting list with session', async () => {
      const id = '507f1f77bcf86cd799439011';
      const volunteerId = 'vol-123';
      const session = {} as any;

      mockCollection.updateOne = jest.fn().mockResolvedValue({ modifiedCount: 1 });

      await repository.removeVolunteerWaiting(id, volunteerId, { session });

      expect(mockCollection.updateOne).toHaveBeenCalledWith(
        { _id: new ObjectId(id) },
        { $pull: { volunteersWaiting: { id: volunteerId } } },
        { session },
      );
    });
  });

  describe('removeParticipantEverywhere', () => {
    it('should remove participant from all announcements', async () => {
      const participantId = 'part-123';

      mockCollection.updateMany = jest.fn().mockResolvedValue({ modifiedCount: 2 });

      const result = await repository.removeParticipantEverywhere(participantId);

      expect(result).toBe(2);
      expect(mockCollection.updateMany).toHaveBeenCalledWith({}, [
        {
          $set: {
            hadInParticipants: { $in: [participantId, '$participants.id'] },
          },
        },
        {
          $set: {
            participants: {
              $filter: {
                input: '$participants',
                cond: { $ne: ['$$this.id', participantId] },
              },
            },
          },
        },
        {
          $set: {
            nbParticipants: {
              $cond: [
                '$hadInParticipants',
                { $subtract: ['$nbParticipants', 1] },
                '$nbParticipants',
              ],
            },
          },
        },
        {
          $unset: 'hadInParticipants',
        },
      ]);
    });
  });

  describe('findAll', () => {
    it('should return all announcements', async () => {
      const mockAnnouncements = [
        { _id: '1', nameEvent: 'Event 1' },
        { _id: '2', nameEvent: 'Event 2' },
      ];

      mockCollection.find = jest.fn().mockReturnValue({
        toArray: jest.fn().mockResolvedValue(mockAnnouncements),
      });

      const result = await repository.findAll();

      expect(mockCollection.find).toHaveBeenCalledWith();
      expect(result).toEqual(mockAnnouncements);
    });

    it('should return empty array when no announcements exist', async () => {
      mockCollection.find = jest.fn().mockReturnValue({
        toArray: jest.fn().mockResolvedValue([]),
      });

      const result = await repository.findAll();

      expect(mockCollection.find).toHaveBeenCalledWith();
      expect(result).toEqual([]);
    });

    it('should handle database errors', async () => {
      const error = new Error('Database connection failed');
      mockCollection.find = jest.fn().mockReturnValue({
        toArray: jest.fn().mockRejectedValue(error),
      });

      await expect(repository.findAll()).rejects.toThrow('Database connection failed');
    });
  });

  describe('findById', () => {
    it('should return announcement by id', async () => {
      const announcementId = '507f1f77bcf86cd799439011';
      const mockAnnouncement = { _id: announcementId, nameEvent: 'Test Event' };

      mockCollection.findOne = jest.fn().mockResolvedValue(mockAnnouncement);

      const result = await repository.findById(announcementId);

      expect(mockCollection.findOne).toHaveBeenCalledWith({ _id: expect.any(Object) });
      expect(result).toEqual(mockAnnouncement);
    });

    it('should return null when announcement not found', async () => {
      const announcementId = '507f1f77bcf86cd799439011';

      mockCollection.findOne = jest.fn().mockResolvedValue(null);

      const result = await repository.findById(announcementId);

      expect(mockCollection.findOne).toHaveBeenCalledWith({ _id: expect.any(Object) });
      expect(result).toBeNull();
    });

    it('should handle invalid ObjectId', async () => {
      const invalidId = 'invalid-id';

      await expect(repository.findById(invalidId)).rejects.toThrow('Invalid ObjectId');
    });
  });

  describe('findByAssociationId', () => {
    it('should return announcements by association id', async () => {
      const associationId = 'assoc-123';
      const mockAnnouncements = [
        { _id: '1', associationId, nameEvent: 'Event 1' },
        { _id: '2', associationId, nameEvent: 'Event 2' },
      ];

      mockCollection.find = jest.fn().mockReturnValue({
        toArray: jest.fn().mockResolvedValue(mockAnnouncements),
      });

      const result = await repository.findByAssociationId(associationId);

      expect(mockCollection.find).toHaveBeenCalledWith({ associationId });
      expect(result).toEqual(mockAnnouncements);
    });

    it('should return empty array when no announcements found for association', async () => {
      const associationId = 'assoc-456';

      mockCollection.find = jest.fn().mockReturnValue({
        toArray: jest.fn().mockResolvedValue([]),
      });

      const result = await repository.findByAssociationId(associationId);

      expect(mockCollection.find).toHaveBeenCalledWith({ associationId });
      expect(result).toEqual([]);
    });
  });

  describe('create', () => {
    it('should create announcement and return inserted id', async () => {
      const mockAnnouncement: Partial<Announcement> = {
        nameEvent: 'Test Event',
        description: 'Test Description',
        associationId: 'assoc-123',
        datePublication: '2024-01-01',
        dateEvent: '2024-01-15',
        hoursEvent: '14:00',
        associationName: 'Test Association',
        maxParticipants: 10,
        maxVolunteers: 5,
        status: AnnouncementStatus.ACTIVE,
      };
      const insertedId = '507f1f77bcf86cd799439011';

      mockCollection.insertOne = jest.fn().mockResolvedValue({
        insertedId: { toString: () => insertedId },
      });

      const result = await repository.create(mockAnnouncement as Announcement);

      expect(mockCollection.insertOne).toHaveBeenCalledWith(mockAnnouncement);
      expect(result).toBe(insertedId);
    });

    it('should handle database errors during creation', async () => {
      const mockAnnouncement: Partial<Announcement> = {
        nameEvent: 'Test Event',
        description: 'Test Description',
        datePublication: '2024-01-01',
        dateEvent: '2024-01-15',
        hoursEvent: '14:00',
        associationId: 'assoc-123',
        associationName: 'Test Association',
        maxParticipants: 10,
        maxVolunteers: 5,
        status: AnnouncementStatus.ACTIVE,
      };
      const error = new Error('Insert failed');

      mockCollection.insertOne = jest.fn().mockRejectedValue(error);

      await expect(repository.create(mockAnnouncement as Announcement)).rejects.toThrow(
        'Insert failed',
      );
    });
  });

  describe('updateVolunteer', () => {
    it('should update announcement and return partial announcement', async () => {
      const announcementId = '507f1f77bcf86cd799439011';
      const updateData = { nameEvent: 'Updated Event', description: 'Updated Description' };

      mockCollection.updateOne = jest.fn().mockResolvedValue({ modifiedCount: 1 });

      const result = await repository.updateVolunteer(announcementId, updateData);

      expect(mockCollection.updateOne).toHaveBeenCalledWith(
        { _id: expect.any(Object) },
        { $set: updateData },
      );
      expect(result).toEqual(updateData);
    });

    it('should handle invalid ObjectId in updateVolunteer', async () => {
      const invalidId = 'invalid-id';
      const updateData = { nameEvent: 'Updated Event' };

      await expect(repository.updateVolunteer(invalidId, updateData)).rejects.toThrow(
        'Invalid ObjectId',
      );
    });
  });

  describe('delete', () => {
    it('should delete announcement and return true', async () => {
      const announcementId = '507f1f77bcf86cd799439011';

      mockCollection.deleteOne = jest.fn().mockResolvedValue({ deletedCount: 1 });

      const result = await repository.delete(announcementId);

      expect(mockCollection.deleteOne).toHaveBeenCalledWith({ _id: expect.any(Object) });
      expect(result).toBe(true);
    });

    it('should return false when announcement not found', async () => {
      const announcementId = '507f1f77bcf86cd799439011';

      mockCollection.deleteOne = jest.fn().mockResolvedValue({ deletedCount: 0 });

      const result = await repository.delete(announcementId);

      expect(mockCollection.deleteOne).toHaveBeenCalledWith({ _id: expect.any(Object) });
      expect(result).toBe(false);
    });

    it('should handle invalid ObjectId in delete', async () => {
      const invalidId = 'invalid-id';

      await expect(repository.delete(invalidId)).rejects.toThrow('Invalid ObjectId');
    });
  });

  describe('deleteByAssociationId', () => {
    it('should delete announcements by association id and return true', async () => {
      const associationId = 'assoc-123';

      mockCollection.deleteMany = jest.fn().mockResolvedValue({ deletedCount: 3 });

      const result = await repository.deleteByAssociationId(associationId);

      expect(mockCollection.deleteMany).toHaveBeenCalledWith({ associationId });
      expect(result).toBe(true);
    });

    it('should return false when no announcements found for association', async () => {
      const associationId = 'assoc-456';

      mockCollection.deleteMany = jest.fn().mockResolvedValue({ deletedCount: 0 });

      const result = await repository.deleteByAssociationId(associationId);

      expect(mockCollection.deleteMany).toHaveBeenCalledWith({ associationId });
      expect(result).toBe(false);
    });
  });

  describe('removeVolunteer', () => {
    it('should remove volunteer and update nbVolunteers', async () => {
      const announcementId = '507f1f77bcf86cd799439011';
      const volunteerId = 'vol-123';
      const nbVolunteers = 5;

      mockCollection.updateOne = jest.fn().mockResolvedValue({ modifiedCount: 1 });

      await repository.removeVolunteer(announcementId, volunteerId, nbVolunteers);

      expect(mockCollection.updateOne).toHaveBeenCalledWith(
        { _id: expect.any(Object) },
        { $pull: { volunteers: { id: volunteerId } }, $set: { nbVolunteers } },
      );
    });
  });

  describe('removeParticipant', () => {
    it('should remove participant from announcement', async () => {
      const id = '507f1f77bcf86cd799439011';
      const participantId = 'part-123';
      const nbParticipants = 1;

      mockCollection.updateOne = jest.fn().mockResolvedValue({ modifiedCount: 1 });

      await repository.removeParticipant(id, participantId, nbParticipants);

      expect(mockCollection.updateOne).toHaveBeenCalledWith(
        { _id: new ObjectId(id) },
        {
          $pull: { participants: { id: participantId } },
          $set: { nbParticipants },
        },
      );
    });
  });

  describe('updateStatus', () => {
    it('should update announcement status', async () => {
      const id = '507f1f77bcf86cd799439011';
      const status = AnnouncementStatus.ACTIVE;
      const mockAnnouncement = { _id: id, status };

      mockCollection.updateOne = jest.fn().mockResolvedValue({ modifiedCount: 1 });
      mockCollection.findOne = jest.fn().mockResolvedValue(mockAnnouncement);

      const result = await repository.updateStatus(id, status);

      expect(result).toEqual(mockAnnouncement);
      expect(mockCollection.updateOne).toHaveBeenCalledWith(
        { _id: new ObjectId(id) },
        { $set: { status } },
      );
      expect(mockCollection.findOne).toHaveBeenCalledWith({ _id: new ObjectId(id) });
    });
  });

  describe('update', () => {
    it('should update announcement with provided data', async () => {
      const id = '507f1f77bcf86cd799439011';
      const updateData = { nameEvent: 'Updated Event' };

      mockCollection.updateOne = jest.fn().mockResolvedValue({ modifiedCount: 1 });

      await repository.update(id, updateData);

      expect(mockCollection.updateOne).toHaveBeenCalledWith(
        { _id: new ObjectId(id) },
        {
          $set: {
            ...updateData,
            updatedAt: expect.any(Date),
          },
        },
      );
    });
  });

  describe('removeVolunteer', () => {
    it('should remove volunteer from announcement', async () => {
      const id = '507f1f77bcf86cd799439011';
      const volunteerId = 'vol-123';
      const nbVolunteers = 2;

      mockCollection.updateOne = jest.fn().mockResolvedValue({ modifiedCount: 1 });

      await repository.removeVolunteer(id, volunteerId, nbVolunteers);

      expect(mockCollection.updateOne).toHaveBeenCalledWith(
        { _id: new ObjectId(id) },
        {
          $pull: { volunteers: { id: volunteerId } },
          $set: { nbVolunteers },
        },
      );
    });
  });

  describe('removeParticipant', () => {
    it('should remove participant from announcement', async () => {
      const id = '507f1f77bcf86cd799439011';
      const participantId = 'part-123';
      const nbParticipants = 1;

      mockCollection.updateOne = jest.fn().mockResolvedValue({ modifiedCount: 1 });

      await repository.removeParticipant(id, participantId, nbParticipants);

      expect(mockCollection.updateOne).toHaveBeenCalledWith(
        { _id: new ObjectId(id) },
        {
          $pull: { participants: { id: participantId } },
          $set: { nbParticipants },
        },
      );
    });
  });

  describe('findWithAggregation', () => {
    beforeEach(() => {
      mockCollection.aggregate = jest.fn();
    });

    function makeMockAggregationCursor(mockResult) {
      return Object.assign({
        toArray: jest.fn().mockResolvedValue(mockResult),
        pipeline: jest.fn(),
        clone: jest.fn(),
        map: jest.fn(),
        explain: jest.fn(),
        hasNext: jest.fn(),
        next: jest.fn(),
        forEach: jest.fn(),
        close: jest.fn(),
        [Symbol.asyncIterator]: jest.fn(),
      });
    }

    it('should return paginated results with meta for basic filter', async () => {
      const mockResult = [
        {
          docs: [mockAnnouncements[0], mockAnnouncements[1], mockAnnouncements[2]],
          meta: [{ total: 3 }],
          total: 3,
        },
      ];
      mockCollection.aggregate.mockReturnValue(makeMockAggregationCursor(mockResult));
      const result = await repository.findWithAggregation(basicFilterDto);
      expect(mockCollection.aggregate).toHaveBeenCalledWith(expect.any(Array));
      expect(result).toEqual({
        annonces: [mockAnnouncements[0], mockAnnouncements[1], mockAnnouncements[2]],
        meta: { page: 1, limit: 2, total: 3, pages: 2 },
      });
    });

    it('should handle geo filter', async () => {
      const mockResult = [{ docs: [mockAnnouncements[0]], meta: [{ total: 1 }], total: 1 }];
      mockCollection.aggregate.mockReturnValue(makeMockAggregationCursor(mockResult));
      const result = await repository.findWithAggregation(geoFilterDto);
      expect(mockCollection.aggregate).toHaveBeenCalledWith(expect.any(Array));
      expect(result.annonces.length).toBe(1);
    });

    it('should handle tag filter', async () => {
      const mockResult = [
        { docs: [mockAnnouncements[0], mockAnnouncements[3]], meta: [{ total: 2 }], total: 2 },
      ];
      mockCollection.aggregate.mockReturnValue(makeMockAggregationCursor(mockResult));
      const result = await repository.findWithAggregation(tagFilterDto);
      expect(mockCollection.aggregate).toHaveBeenCalledWith(expect.any(Array));
      expect(result.annonces[0].tags).toContain('solidarity');
    });

    it('should handle date filter', async () => {
      const mockResult = [
        { docs: [mockAnnouncements[0], mockAnnouncements[1]], meta: [{ total: 2 }], total: 2 },
      ];
      mockCollection.aggregate.mockReturnValue(makeMockAggregationCursor(mockResult));
      const result = await repository.findWithAggregation(dateFilterDto);
      expect(mockCollection.aggregate).toHaveBeenCalledWith(expect.any(Array));
      expect(result.annonces[0].dateEvent).toBeDefined();
    });

    it('should handle status filter', async () => {
      const mockResult = [
        {
          docs: [mockAnnouncements[0], mockAnnouncements[2], mockAnnouncements[3]],
          meta: [{ total: 3 }],
          total: 3,
        },
      ];
      mockCollection.aggregate.mockReturnValue(makeMockAggregationCursor(mockResult));
      const result = await repository.findWithAggregation(statusFilterDto);
      expect(result.annonces.every(a => a.status === 'ACTIVE')).toBe(true);
    });

    it('should handle associationName filter', async () => {
      const mockResult = [
        { docs: [mockAnnouncements[0], mockAnnouncements[3]], meta: [{ total: 2 }], total: 2 },
      ];
      mockCollection.aggregate.mockReturnValue(makeMockAggregationCursor(mockResult));
      const result = await repository.findWithAggregation(associationNameFilterDto);
      expect(result.annonces.every(a => a.associationName === 'Solidarity Org')).toBe(true);
    });

    it('should handle hoursEvent interval filter', async () => {
      const mockResult = [
        { docs: [mockAnnouncements[0], mockAnnouncements[2]], meta: [{ total: 2 }], total: 2 },
      ];
      mockCollection.aggregate.mockReturnValue(makeMockAggregationCursor(mockResult));
      const result = await repository.findWithAggregation(hoursEventFilterDto);
      expect(result.annonces.length).toBeGreaterThan(0);
    });

    it('should handle publicationInterval filter', async () => {
      const mockResult = [
        {
          docs: [
            mockAnnouncements[0],
            mockAnnouncements[1],
            mockAnnouncements[2],
            mockAnnouncements[3],
          ],
          meta: [{ total: 4 }],
          total: 4,
        },
      ];
      mockCollection.aggregate.mockReturnValue(makeMockAggregationCursor(mockResult));
      const result = await repository.findWithAggregation(publicationIntervalFilterDto);
      expect(result.annonces.length).toBeGreaterThan(0);
    });

    it('should return empty results if no match', async () => {
      const mockResult = [{ docs: [], meta: [{ total: 0 }], total: 0 }];
      mockCollection.aggregate.mockReturnValue(makeMockAggregationCursor(mockResult));
      const result = await repository.findWithAggregation({
        nameEvent: 'NotFound',
        page: 1,
        limit: 2,
      });
      expect(result.annonces).toEqual([]);
      expect(result.meta.total).toBe(0);
    });

    it('should throw error if aggregate fails', async () => {
      mockCollection.aggregate.mockReturnValue(
        Object.assign({
          toArray: jest.fn().mockRejectedValue(new Error('Aggregate failed')),
          pipeline: jest.fn(),
          clone: jest.fn(),
          map: jest.fn(),
          explain: jest.fn(),
          hasNext: jest.fn(),
          next: jest.fn(),
          forEach: jest.fn(),
          close: jest.fn(),
          [Symbol.asyncIterator]: jest.fn(),
        }),
      );
      await expect(repository.findWithAggregation(basicFilterDto)).rejects.toThrow(
        'Aggregate failed',
      );
    });

    it('should handle multiple filters applied at the same time', async () => {
      const multiFilterDto = {
        nameEvent: 'Event',
        tags: ['solidarity', 'food'],
        status: 'ACTIVE',
        associationName: 'Solidarity Org',
        dateEventFrom: '2024-01-09T00:00:00Z',
        dateEventTo: '2024-01-13T23:59:59Z',
        latitude: 48.85,
        longitude: 2.35,
        radius: 100000,
        page: 1,
        limit: 5,
      };
      const mockResult = [
        { docs: [mockAnnouncements[0], mockAnnouncements[3]], meta: [{ total: 2 }], total: 2 },
      ];
      mockCollection.aggregate.mockReturnValue(makeMockAggregationCursor(mockResult));
      const result = await repository.findWithAggregation(multiFilterDto);
      expect(mockCollection.aggregate).toHaveBeenCalledWith(expect.any(Array));
      expect(result.annonces.length).toBe(2);
      expect(result.annonces[0].associationName).toBe('Solidarity Org');
      expect(result.annonces[0].status).toBe('ACTIVE');
      expect(result.annonces[0].tags).toEqual(expect.arrayContaining(['solidarity', 'food']));
    });

    it('should handle multiple filters applied at the same time with page=1, limit=1', async () => {
      const multiFilterDto = {
        nameEvent: 'Event',
        tags: ['solidarity', 'food'],
        status: 'ACTIVE',
        associationName: 'Solidarity Org',
        dateEventFrom: '2024-01-09T00:00:00Z',
        dateEventTo: '2024-01-13T23:59:59Z',
        latitude: 48.85,
        longitude: 2.35,
        radius: 100000,
        page: 1,
        limit: 1,
      };
      const mockResult = [{ docs: [mockAnnouncements[0]], meta: [{ total: 2 }], total: 2 }];
      mockCollection.aggregate.mockReturnValue(makeMockAggregationCursor(mockResult));
      const result = await repository.findWithAggregation(multiFilterDto);
      expect(result.annonces.length).toBe(1);
      expect(result.meta.page).toBe(1);
      expect(result.meta.limit).toBe(1);
      expect(result.meta.total).toBe(2);
      expect(result.meta.pages).toBe(2);
    });

    it('should handle multiple filters applied at the same time with page=2, limit=1', async () => {
      const multiFilterDto = {
        nameEvent: 'Event',
        tags: ['solidarity', 'food'],
        status: 'ACTIVE',
        associationName: 'Solidarity Org',
        dateEventFrom: '2024-01-09T00:00:00Z',
        dateEventTo: '2024-01-13T23:59:59Z',
        latitude: 48.85,
        longitude: 2.35,
        radius: 100000,
        page: 2,
        limit: 1,
      };
      const mockResult = [{ docs: [mockAnnouncements[3]], meta: [{ total: 2 }], total: 2 }];
      mockCollection.aggregate.mockReturnValue(makeMockAggregationCursor(mockResult));
      const result = await repository.findWithAggregation(multiFilterDto);
      expect(result.annonces.length).toBe(1);
      expect(result.meta.page).toBe(2);
      expect(result.meta.limit).toBe(1);
      expect(result.meta.total).toBe(2);
      expect(result.meta.pages).toBe(2);
    });

    it('should handle multiple filters applied at the same time with page=1, limit=2', async () => {
      const multiFilterDto = {
        nameEvent: 'Event',
        tags: ['solidarity', 'food'],
        status: 'ACTIVE',
        associationName: 'Solidarity Org',
        dateEventFrom: '2024-01-09T00:00:00Z',
        dateEventTo: '2024-01-13T23:59:59Z',
        latitude: 48.85,
        longitude: 2.35,
        radius: 100000,
        page: 1,
        limit: 2,
      };
      const mockResult = [
        { docs: [mockAnnouncements[0], mockAnnouncements[3]], meta: [{ total: 2 }], total: 2 },
      ];
      mockCollection.aggregate.mockReturnValue(makeMockAggregationCursor(mockResult));
      const result = await repository.findWithAggregation(multiFilterDto);
      expect(result.annonces.length).toBe(2);
      expect(result.meta.page).toBe(1);
      expect(result.meta.limit).toBe(2);
      expect(result.meta.total).toBe(2);
      expect(result.meta.pages).toBe(1);
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

      const mockResult = [
        {
          docs: [mockAnnouncements[0], mockAnnouncements[1]],
          meta: [{ total: 2 }],
          total: 2,
        },
      ];

      mockCollection.aggregate = jest.fn().mockReturnValue({
        toArray: jest.fn().mockResolvedValue(mockResult),
      });

      const result = await repository.filterAssociationAnnouncements(filterDto);

      expect(mockCollection.aggregate).toHaveBeenCalledWith(expect.any(Array));
      expect(result).toEqual({
        annonces: [mockAnnouncements[0], mockAnnouncements[1]],
        meta: { page: 1, limit: 10, total: 2, pages: 1 },
      });
    });

    it('should handle empty results for association', async () => {
      const filterDto: FilterAssociationAnnouncementDto = {
        associationId: 'assoc-456',
        page: 1,
        limit: 10,
      };

      const mockResult = [{ docs: [], meta: [{ total: 0 }], total: 0 }];

      mockCollection.aggregate = jest.fn().mockReturnValue({
        toArray: jest.fn().mockResolvedValue(mockResult),
      });

      const result = await repository.filterAssociationAnnouncements(filterDto);

      expect(mockCollection.aggregate).toHaveBeenCalledWith(expect.any(Array));
      expect(result.annonces).toEqual([]);
      expect(result.meta.total).toBe(0);
    });

    it('should handle stateEvent filter PAST', async () => {
      const filterDto: FilterAssociationAnnouncementDto = {
        associationId: 'assoc-123',
        stateEvent: 'PAST',
        page: 1,
        limit: 10,
      };

      const mockResult = [{ docs: [mockAnnouncements[0]], meta: [{ total: 1 }], total: 1 }];

      mockCollection.aggregate = jest.fn().mockReturnValue({
        toArray: jest.fn().mockResolvedValue(mockResult),
      });

      const result = await repository.filterAssociationAnnouncements(filterDto);

      expect(mockCollection.aggregate).toHaveBeenCalledWith(expect.any(Array));
      expect(result.annonces.length).toBe(1);
    });

    it('should handle stateEvent filter UPCOMING', async () => {
      const filterDto: FilterAssociationAnnouncementDto = {
        associationId: 'assoc-123',
        stateEvent: 'UPCOMING',
        page: 1,
        limit: 10,
      };

      const mockResult = [{ docs: [mockAnnouncements[1]], meta: [{ total: 1 }], total: 1 }];

      mockCollection.aggregate = jest.fn().mockReturnValue({
        toArray: jest.fn().mockResolvedValue(mockResult),
      });

      const result = await repository.filterAssociationAnnouncements(filterDto);

      expect(mockCollection.aggregate).toHaveBeenCalledWith(expect.any(Array));
      expect(result.annonces.length).toBe(1);
    });

    it('should handle stateEvent filter NOW', async () => {
      const filterDto: FilterAssociationAnnouncementDto = {
        associationId: 'assoc-123',
        stateEvent: 'NOW',
        page: 1,
        limit: 10,
      };

      const mockResult = [{ docs: [mockAnnouncements[2]], meta: [{ total: 1 }], total: 1 }];

      mockCollection.aggregate = jest.fn().mockReturnValue({
        toArray: jest.fn().mockResolvedValue(mockResult),
      });

      const result = await repository.filterAssociationAnnouncements(filterDto);

      expect(mockCollection.aggregate).toHaveBeenCalledWith(expect.any(Array));
      expect(result.annonces.length).toBe(1);
    });
  });

  describe('findVolunteerInAnnouncementByVolunteerId', () => {
    it('should return announcements where volunteer is registered', async () => {
      const volunteerId = 'vol-123';
      const mockAnnouncements = [
        {
          _id: 'ann-1',
          volunteers: [{ id: volunteerId }],
          dateEvent: '2024-02-15',
          hoursEvent: '14:00',
          status: 'ACTIVE',
        },
        {
          _id: 'ann-2',
          volunteersWaiting: [{ id: volunteerId }],
          dateEvent: '2024-02-16',
          hoursEvent: '15:00',
          status: 'ACTIVE',
        },
      ];

      mockCollection.find = jest.fn().mockReturnValue({
        toArray: jest.fn().mockResolvedValue(mockAnnouncements),
      });

      const result = await repository.findVolunteerInAnnouncementByVolunteerId(volunteerId);

      expect(mockCollection.find).toHaveBeenCalledWith({
        $and: [
          {
            $or: [{ 'volunteers.id': volunteerId }, { 'volunteersWaiting.id': volunteerId }],
          },
          {
            $or: [
              { dateEvent: { $gt: '2024-01-15' } },
              {
                dateEvent: '2024-01-15',
                hoursEvent: { $gte: '10:00' },
              },
            ],
          },
          { status: { $ne: 'INACTIVE' } },
        ],
      });
      expect(result).toEqual(mockAnnouncements);
    });

    it('should return empty array when volunteer not found', async () => {
      const volunteerId = 'vol-456';

      mockCollection.find = jest.fn().mockReturnValue({
        toArray: jest.fn().mockResolvedValue([]),
      });

      const result = await repository.findVolunteerInAnnouncementByVolunteerId(volunteerId);

      expect(mockCollection.find).toHaveBeenCalledWith({
        $and: [
          {
            $or: [{ 'volunteers.id': volunteerId }, { 'volunteersWaiting.id': volunteerId }],
          },
          {
            $or: [
              { dateEvent: { $gt: '2024-01-15' } },
              {
                dateEvent: '2024-01-15',
                hoursEvent: { $gte: '10:00' },
              },
            ],
          },
          { status: { $ne: 'INACTIVE' } },
        ],
      });
      expect(result).toEqual([]);
    });
  });

  describe('findPastAnnouncementsByParticipantId', () => {
    it('should return past announcements for a participant', async () => {
      const participantId = 'part-123';
      const mockAnnouncements = [
        {
          _id: 'ann-1',
          dateEvent: '2024-01-10',
          hoursEvent: '09:00',
          participants: [{ id: participantId }],
          status: 'ACTIVE',
        },
        {
          _id: 'ann-2',
          dateEvent: '2024-01-14',
          hoursEvent: '08:00',
          volunteers: [{ id: participantId }],
          status: 'ACTIVE',
        },
      ];

      mockCollection.find = jest.fn().mockReturnValue({
        toArray: jest.fn().mockResolvedValue(mockAnnouncements),
      });

      const result = await repository.findPastAnnouncementsByParticipantId(participantId);

      expect(mockCollection.find).toHaveBeenCalledWith({
        $and: [
          {
            $or: [{ 'participants.id': participantId }, { 'volunteers.id': participantId }],
          },
          {
            $or: [
              { dateEvent: { $lt: '2024-01-15' } },
              {
                dateEvent: '2024-01-15',
                hoursEvent: { $lte: '10:00' },
              },
            ],
          },
          { status: { $ne: 'INACTIVE' } },
        ],
      });
      expect(result).toEqual(mockAnnouncements);
    });

    it('should return empty array when no past announcements found', async () => {
      const participantId = 'part-456';

      mockCollection.find = jest.fn().mockReturnValue({
        toArray: jest.fn().mockResolvedValue([]),
      });

      const result = await repository.findPastAnnouncementsByParticipantId(participantId);

      expect(mockCollection.find).toHaveBeenCalledWith({
        $and: [
          {
            $or: [{ 'participants.id': participantId }, { 'volunteers.id': participantId }],
          },
          {
            $or: [
              { dateEvent: { $lt: '2024-01-15' } },
              {
                dateEvent: '2024-01-15',
                hoursEvent: { $lte: '10:00' },
              },
            ],
          },
          { status: { $ne: 'INACTIVE' } },
        ],
      });
      expect(result).toEqual([]);
    });
  });

  describe('findParticipantInParticipantsByParticipantId', () => {
    it('should return future announcements for a participant', async () => {
      const participantId = 'part-123';
      const mockAnnouncements = [
        {
          _id: 'ann-1',
          dateEvent: '2024-02-15',
          hoursEvent: '14:00',
          participants: [{ id: participantId }],
          status: 'ACTIVE',
        },
        {
          _id: 'ann-2',
          dateEvent: '2024-02-16',
          hoursEvent: '15:00',
          participants: [{ id: participantId }],
          status: 'ACTIVE',
        },
      ];

      mockCollection.find = jest.fn().mockReturnValue({
        toArray: jest.fn().mockResolvedValue(mockAnnouncements),
      });

      const result = await repository.findParticipantInParticipantsByParticipantId(participantId);

      expect(mockCollection.find).toHaveBeenCalledWith({
        $and: [
          { 'participants.id': participantId },
          {
            $or: [
              { dateEvent: { $gt: '2024-01-15' } },
              {
                dateEvent: '2024-01-15',
                hoursEvent: { $gte: '10:00' },
              },
            ],
          },
          { status: { $ne: 'INACTIVE' } },
        ],
      });
      expect(result).toEqual(mockAnnouncements);
    });

    it('should return empty array when no future announcements found for participant', async () => {
      const participantId = 'part-456';

      mockCollection.find = jest.fn().mockReturnValue({
        toArray: jest.fn().mockResolvedValue([]),
      });

      const result = await repository.findParticipantInParticipantsByParticipantId(participantId);

      expect(mockCollection.find).toHaveBeenCalledWith({
        $and: [
          { 'participants.id': participantId },
          {
            $or: [
              { dateEvent: { $gt: '2024-01-15' } },
              {
                dateEvent: '2024-01-15',
                hoursEvent: { $gte: '10:00' },
              },
            ],
          },
          { status: { $ne: 'INACTIVE' } },
        ],
      });
      expect(result).toEqual([]);
    });
  });
});
