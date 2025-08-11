import { Test, TestingModule } from '@nestjs/testing';
import { SupportController } from './support.controller';
import { SupportService } from '../services/support.service';
import { CreateReportDto } from '../dto/create-report.dto';
import {
  AnnouncementReportCategory,
  ReportStatus,
  ReportType,
} from '../interfaces/support.interface';
import { NotFoundException } from '@nestjs/common';

describe('SupportController', () => {
  let controller: SupportController;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let service: SupportService;

  const mockService = {
    createReport: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    findByUserId: jest.fn(),
    findByAnnouncementId: jest.fn(),
    updateReport: jest.fn(),
    updateStatus: jest.fn(),
    updatePriority: jest.fn(),
    deleteReport: jest.fn(),
    filterReports: jest.fn(),
    getStats: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SupportController],
      providers: [
        {
          provide: SupportService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<SupportController>(SupportController);
    service = module.get<SupportService>(SupportService);
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
        priority: 'MEDIUM',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockService.createReport.mockResolvedValue(expectedReport);

      const mockRequest = {
        user: { userId: 'test-user-id' },
      };

      const result = await controller.createReport(createReportDto, mockRequest);

      expect(result).toEqual(expectedReport);
      expect(mockService.createReport).toHaveBeenCalledWith(createReportDto, 'test-user-id');
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

      mockService.findById.mockResolvedValue(expectedReport);

      const result = await controller.findById('test-id');

      expect(result).toEqual(expectedReport);
      expect(mockService.findById).toHaveBeenCalledWith('test-id');
    });

    it('should throw NotFoundException when report not found', async () => {
      mockService.findById.mockRejectedValue(new NotFoundException('Report not found'));

      await expect(controller.findById('test-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateStatus', () => {
    it('should update status successfully', async () => {
      const expectedReport = {
        id: 'test-id',
        status: ReportStatus.IN_PROGRESS,
      };

      mockService.updateStatus.mockResolvedValue(expectedReport);

      const result = await controller.updateStatus('test-id', ReportStatus.IN_PROGRESS);

      expect(result).toEqual(expectedReport);
      expect(mockService.updateStatus).toHaveBeenCalledWith('test-id', ReportStatus.IN_PROGRESS);
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

      mockService.getStats.mockResolvedValue(expectedStats);

      const result = await controller.getStats();

      expect(result).toEqual(expectedStats);
      expect(mockService.getStats).toHaveBeenCalled();
    });
  });
});
