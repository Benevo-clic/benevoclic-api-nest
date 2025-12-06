import { Test, TestingModule } from '@nestjs/testing';
import { AnnouncementRepository } from './announcement.repository';
import { Announcement } from '../entities/announcement.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { mockAnnouncements } from './__mocks__/announcement.mock';
import {
  basicFilterDto,
  geoFilterDto,
  tagFilterDto,
  dateFilterDto,
  statusFilterDto,
  associationNameFilterDto,
  hoursEventFilterDto,
  publicationIntervalFilterDto,
} from '../dto/__mocks__/filter-announcement.mock';
import { AnnouncementStatus } from '../interfaces/announcement.interface';
import { FilterAssociationAnnouncementDto } from '../dto/filter-association-announcement.dto';

jest.mock('luxon', () => ({
  DateTime: {
    now: jest.fn().mockReturnValue({
      setZone: jest.fn().mockReturnValue({
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

describe('AnnouncementRepository', () => {
  let repository: AnnouncementRepository;
  let mockTypeOrmRepository: Partial<Repository<Announcement>>;
  let mockQueryBuilder: any;

  beforeEach(async () => {
    mockQueryBuilder = {
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([]),
      getCount: jest.fn().mockResolvedValue(0),
      getOne: jest.fn().mockResolvedValue(null),
      delete: jest.fn().mockReturnThis(),
      from: jest.fn().mockReturnThis(),
      execute: jest.fn().mockResolvedValue({ affected: 1 }),
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      getRawOne: jest.fn().mockResolvedValue({}),
    };

    mockTypeOrmRepository = {
      find: jest.fn(),
      findBy: jest.fn(),
      findOneBy: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      createQueryBuilder: jest.fn(() => mockQueryBuilder),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnnouncementRepository,
        {
          provide: getRepositoryToken(Announcement),
          useValue: mockTypeOrmRepository,
        },
      ],
    }).compile();

    repository = module.get<AnnouncementRepository>(AnnouncementRepository);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all announcements', async () => {
      (mockTypeOrmRepository.find as jest.Mock).mockResolvedValue(mockAnnouncements);
      const result = await repository.findAll();
      expect(mockTypeOrmRepository.find).toHaveBeenCalled();
      expect(result).toEqual(mockAnnouncements);
    });
  });

  describe('findById', () => {
    it('should return announcement by id', async () => {
      const id = '1';
      const mockAnnouncement = mockAnnouncements[0];
      (mockTypeOrmRepository.findOneBy as jest.Mock).mockResolvedValue(mockAnnouncement);
      const result = await repository.findById(id);
      expect(mockTypeOrmRepository.findOneBy).toHaveBeenCalledWith({ id });
      expect(result).toEqual(mockAnnouncement);
    });
  });

  describe('findByAssociationId', () => {
    it('should return announcements by association id', async () => {
      const associationId = 'assoc-1';
      (mockTypeOrmRepository.findBy as jest.Mock).mockResolvedValue(mockAnnouncements);
      const result = await repository.findByAssociationId(associationId);
      expect(mockTypeOrmRepository.findBy).toHaveBeenCalledWith({ associationId });
      expect(result).toEqual(mockAnnouncements);
    });
  });

  describe('create', () => {
    it('should create and save announcement', async () => {
      const createDto = mockAnnouncements[0];
      (mockTypeOrmRepository.create as jest.Mock).mockReturnValue(createDto);
      (mockTypeOrmRepository.save as jest.Mock).mockResolvedValue(createDto);
      const result = await repository.create(createDto);
      expect(mockTypeOrmRepository.create).toHaveBeenCalledWith(createDto);
      expect(mockTypeOrmRepository.save).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(createDto.id);
    });
  });

  describe('update', () => {
    it('should update announcement', async () => {
      const id = '1';
      const updateDto = { nameEvent: 'Updated' };
      (mockTypeOrmRepository.update as jest.Mock).mockResolvedValue({ affected: 1 });
      await repository.update(id, updateDto);
      expect(mockTypeOrmRepository.update).toHaveBeenCalledWith({ id }, expect.objectContaining(updateDto));
    });
  });

  describe('delete', () => {
    it('should delete announcement', async () => {
      const id = '1';
      (mockTypeOrmRepository.delete as jest.Mock).mockResolvedValue({ affected: 1 });
      const result = await repository.delete(id);
      expect(mockTypeOrmRepository.delete).toHaveBeenCalledWith({ id });
      expect(result).toBe(true);
    });
  });

  describe('deleteByAssociationId', () => {
    it('should delete announcements by association id', async () => {
      const associationId = 'assoc-1';
      (mockTypeOrmRepository.delete as jest.Mock).mockResolvedValue({ affected: 5 });
      const result = await repository.deleteByAssociationId(associationId);
      expect(mockTypeOrmRepository.delete).toHaveBeenCalledWith({ associationId });
      expect(result).toBe(true);
    });
  });

  describe('findWithAggregation', () => {
    it('should return paginated results', async () => {
      mockQueryBuilder.getCount.mockResolvedValue(3);
      mockQueryBuilder.getMany.mockResolvedValue(mockAnnouncements);

      const result = await repository.findWithAggregation(basicFilterDto);

      expect(mockTypeOrmRepository.createQueryBuilder).toHaveBeenCalledWith('announcement');
      expect(mockQueryBuilder.skip).toHaveBeenCalled();
      expect(mockQueryBuilder.take).toHaveBeenCalled();
      expect(result.meta.total).toBe(3);
      expect(result.annonces).toEqual(mockAnnouncements);
    });

    it('should apply filters', async () => {
      mockQueryBuilder.getCount.mockResolvedValue(1);
      mockQueryBuilder.getMany.mockResolvedValue([mockAnnouncements[0]]);

      await repository.findWithAggregation({ ...basicFilterDto, nameEvent: 'Test' });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalled();
    });
  });

  describe('filterAssociationAnnouncements', () => {
    it('should return filtered announcements for association', async () => {
      const filterDto: FilterAssociationAnnouncementDto = {
        associationId: 'assoc-1',
        page: 1,
        limit: 10,
      };
      mockQueryBuilder.getCount.mockResolvedValue(2);
      mockQueryBuilder.getMany.mockResolvedValue(mockAnnouncements);

      const result = await repository.filterAssociationAnnouncements(filterDto);

      expect(mockTypeOrmRepository.createQueryBuilder).toHaveBeenCalledWith('announcement');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('announcement.associationId = :associationId', { associationId: 'assoc-1' });
      expect(result.meta.total).toBe(2);
    });
  });

  describe('findVolunteerInAnnouncementByVolunteerId', () => {
    it('should return announcements where volunteer is registered', async () => {
      const volunteerId = 'vol-1';
      mockQueryBuilder.getMany.mockResolvedValue(mockAnnouncements);

      const result = await repository.findVolunteerInAnnouncementByVolunteerId(volunteerId);

      expect(mockTypeOrmRepository.createQueryBuilder).toHaveBeenCalledWith('announcement');
      expect(mockQueryBuilder.where).toHaveBeenCalled();
      expect(result).toEqual(mockAnnouncements);
    });
  });

  describe('findPastAnnouncementsByParticipantId', () => {
    it('should return past announcements for participant', async () => {
      const participantId = 'part-1';
      mockQueryBuilder.getMany.mockResolvedValue(mockAnnouncements);

      const result = await repository.findPastAnnouncementsByParticipantId(participantId);

      expect(mockTypeOrmRepository.createQueryBuilder).toHaveBeenCalledWith('announcement');
      expect(result).toEqual(mockAnnouncements);
    });
  });

  describe('findParticipantInParticipantsByParticipantId', () => {
    it('should return future announcements for participant', async () => {
      const participantId = 'part-1';
      mockQueryBuilder.getMany.mockResolvedValue(mockAnnouncements);

      const result = await repository.findParticipantInParticipantsByParticipantId(participantId);

      expect(mockTypeOrmRepository.createQueryBuilder).toHaveBeenCalledWith('announcement');
      expect(result).toEqual(mockAnnouncements);
    });
  });

  describe('removeVolunteerEverywhere', () => {
    it('should remove volunteer from all announcements', async () => {
      const volunteerId = 'vol-1';
      const announcement = { ...mockAnnouncements[0], volunteers: [{ id: volunteerId }], volunteersWaiting: [] } as any;
      mockQueryBuilder.getMany.mockResolvedValue([announcement]);
      (mockTypeOrmRepository.save as jest.Mock).mockResolvedValue(announcement);

      const result = await repository.removeVolunteerEverywhere(volunteerId);

      expect(mockTypeOrmRepository.createQueryBuilder).toHaveBeenCalledWith('announcement');
      expect(mockTypeOrmRepository.save).toHaveBeenCalled();
      expect(result).toBe(1);
    });
  });

  describe('removeParticipantEverywhere', () => {
    it('should remove participant from all announcements', async () => {
      const participantId = 'part-1';
      const announcement = { ...mockAnnouncements[0], participants: [{ id: participantId }] } as any;
      mockQueryBuilder.getMany.mockResolvedValue([announcement]);
      (mockTypeOrmRepository.save as jest.Mock).mockResolvedValue(announcement);

      const result = await repository.removeParticipantEverywhere(participantId);

      expect(mockTypeOrmRepository.createQueryBuilder).toHaveBeenCalledWith('announcement');
      expect(mockTypeOrmRepository.save).toHaveBeenCalled();
      expect(result).toBe(1);
    });
  });

  describe('removeVolunteerWaiting', () => {
    it('should remove volunteer from waiting list', async () => {
      const id = '1';
      const volunteerId = 'vol-1';
      const announcement = { ...mockAnnouncements[0], volunteersWaiting: [{ id: volunteerId }] } as any;
      (mockTypeOrmRepository.findOneBy as jest.Mock).mockResolvedValue(announcement);
      (mockTypeOrmRepository.save as jest.Mock).mockResolvedValue(announcement);

      await repository.removeVolunteerWaiting(id, volunteerId);

      expect(mockTypeOrmRepository.findOneBy).toHaveBeenCalledWith({ id });
      expect(mockTypeOrmRepository.save).toHaveBeenCalled();
    });
  });

  describe('removeVolunteer', () => {
    it('should remove volunteer from list', async () => {
      const id = '1';
      const volunteerId = 'vol-1';
      const announcement = { ...mockAnnouncements[0], volunteers: [{ id: volunteerId }] } as any;
      (mockTypeOrmRepository.findOneBy as jest.Mock).mockResolvedValue(announcement);
      (mockTypeOrmRepository.save as jest.Mock).mockResolvedValue(announcement);

      await repository.removeVolunteer(id, volunteerId, 5);

      expect(mockTypeOrmRepository.findOneBy).toHaveBeenCalledWith({ id });
      expect(mockTypeOrmRepository.save).toHaveBeenCalled();
    });
  });

  describe('removeParticipant', () => {
    it('should remove participant from list', async () => {
      const id = '1';
      const participantId = 'part-1';
      const announcement = { ...mockAnnouncements[0], participants: [{ id: participantId }] } as any;
      (mockTypeOrmRepository.findOneBy as jest.Mock).mockResolvedValue(announcement);
      (mockTypeOrmRepository.save as jest.Mock).mockResolvedValue(announcement);

      await repository.removeParticipant(id, participantId, 5);

      expect(mockTypeOrmRepository.findOneBy).toHaveBeenCalledWith({ id });
      expect(mockTypeOrmRepository.save).toHaveBeenCalled();
    });
  });

  describe('updateStatus', () => {
    it('should update status', async () => {
      const id = '1';
      const status = AnnouncementStatus.ACTIVE;
      (mockTypeOrmRepository.update as jest.Mock).mockResolvedValue({ affected: 1 });
      (mockTypeOrmRepository.findOneBy as jest.Mock).mockResolvedValue(mockAnnouncements[0]);

      await repository.updateStatus(id, status);

      expect(mockTypeOrmRepository.update).toHaveBeenCalledWith({ id }, { status });
      expect(mockTypeOrmRepository.findOneBy).toHaveBeenCalledWith({ id });
    });
  });

  describe('updateVolunteer', () => {
    it('should update volunteer', async () => {
      const id = '1';
      const updateData = { nameEvent: 'Updated' };
      (mockTypeOrmRepository.update as jest.Mock).mockResolvedValue({ affected: 1 });

      await repository.updateVolunteer(id, updateData);

      expect(mockTypeOrmRepository.update).toHaveBeenCalledWith({ id }, updateData);
    });
  });

  describe('updateAssociationNameByAssociationId', () => {
    it('should update association name', async () => {
      const associationId = 'assoc-1';
      const name = 'New Name';
      (mockTypeOrmRepository.update as jest.Mock).mockResolvedValue({ affected: 1 });

      await repository.updateAssociationNameByAssociationId(associationId, name);

      expect(mockTypeOrmRepository.update).toHaveBeenCalledWith({ associationId }, { associationName: name });
    });
  });

  describe('updateAssociationVisibilityByAssociationId', () => {
    it('should update visibility', async () => {
      const associationId = 'assoc-1';
      const visibility = true;
      (mockTypeOrmRepository.update as jest.Mock).mockResolvedValue({ affected: 1 });

      const result = await repository.updateAssociationVisibilityByAssociationId(associationId, visibility);

      expect(mockTypeOrmRepository.update).toHaveBeenCalledWith({ associationId }, { isHidden: visibility });
      expect(result).toBe(1);
    });
  });
});
