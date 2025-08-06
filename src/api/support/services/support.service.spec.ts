import { Test, TestingModule } from '@nestjs/testing';
import { SupportService } from './support.service';
import { SupportRepository } from '../repositories/support.repository';
import { CreateReportDto } from '../dto/create-report.dto';
import {
  AnnouncementReportCategory,
  ReportPriority,
  ReportStatus,
  ReportType,
} from '../interfaces/support.interface';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('SupportService', () => {
  let service: SupportService;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let repository: SupportRepository;

  const mockRepository = {
    create: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    findByUserId: jest.fn(),
    findByAnnouncementId: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    filterReports: jest.fn(),
    getStats: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SupportService,
        {
          provide: SupportRepository,
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<SupportService>(SupportService);
    repository = module.get<SupportRepository>(SupportRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createReport', () => {
    it('should create a report successfully', async () => {
      const createReportDto: CreateReportDto = {
        type: ReportType.ANNOUNCEMENT,
        category: AnnouncementReportCategory.INAPPROPRIATE_CONTENT,
        description: 'Test description',
        announcementId: 'test-announcement-id',
      };

      const expectedReport = {
        id: 'test-id',
        ...createReportDto,
        status: ReportStatus.PENDING,
        priority: ReportPriority.MEDIUM,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.create.mockResolvedValue(expectedReport);

      const result = await service.createReport(createReportDto, 'test-user-id');

      expect(result).toEqual(expectedReport);
      expect(mockRepository.create).toHaveBeenCalledWith({
        ...createReportDto,
        userId: 'test-user-id',
      });
    });

    it('should throw BadRequestException for announcement report without announcementId', async () => {
      const createReportDto: CreateReportDto = {
        type: ReportType.ANNOUNCEMENT,
        category: AnnouncementReportCategory.INAPPROPRIATE_CONTENT,
        description: 'Test description',
      };

      await expect(service.createReport(createReportDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findById', () => {
    it('should return a report when found', async () => {
      const expectedReport = {
        id: 'test-id',
        type: ReportType.ANNOUNCEMENT,
        category: AnnouncementReportCategory.INAPPROPRIATE_CONTENT,
        description: 'Test description',
        status: ReportStatus.PENDING,
      };

      mockRepository.findById.mockResolvedValue(expectedReport);

      const result = await service.findById('test-id');

      expect(result).toEqual(expectedReport);
      expect(mockRepository.findById).toHaveBeenCalledWith('test-id');
    });

    it('should throw NotFoundException when report not found', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(service.findById('test-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateStatus', () => {
    it('should update status successfully', async () => {
      const expectedReport = {
        id: 'test-id',
        status: ReportStatus.IN_PROGRESS,
      };

      mockRepository.update.mockResolvedValue(expectedReport);

      const result = await service.updateStatus('test-id', ReportStatus.IN_PROGRESS);

      expect(result).toEqual(expectedReport);
      expect(mockRepository.update).toHaveBeenCalledWith('test-id', {
        status: ReportStatus.IN_PROGRESS,
      });
    });
  });

  describe('getStats', () => {
    it('should return statistics', async () => {
      const expectedStats = {
        total: 10,
        pending: 5,
        inProgress: 3,
        resolved: 2,
        rejected: 0,
        announcementReports: 7,
        technicalReports: 3,
      };

      mockRepository.getStats.mockResolvedValue(expectedStats);

      const result = await service.getStats();

      expect(result).toEqual(expectedStats);
      expect(mockRepository.getStats).toHaveBeenCalled();
    });
  });
});
