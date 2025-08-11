import { Test, TestingModule } from '@nestjs/testing';
import { SupportService } from './support.service';
import { SupportRepository } from '../repositories/support.repository';
import { CreateReportDto } from '../dto/create-report.dto';
import {
  AnnouncementReportCategory,
  OtherReportCategory,
  ReportPriority,
  ReportStatus,
  ReportType,
  TechnicalReportCategory,
  UserFeedbackReportCategory,
} from '../interfaces/support.interface';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { DiscordWebhookService } from '../../../common/services/discord/discord-webhook.service';

describe('SupportService', () => {
  let service: SupportService;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let repository: SupportRepository;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let discordWebhookService: DiscordWebhookService;

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

  const mockDiscordWebhookService = {
    sendSupportTicketNotification: jest.fn(),
    sendStatusUpdateNotification: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SupportService,
        {
          provide: SupportRepository,
          useValue: mockRepository,
        },
        {
          provide: DiscordWebhookService,
          useValue: mockDiscordWebhookService,
        },
      ],
    }).compile();

    service = module.get<SupportService>(SupportService);
    repository = module.get<SupportRepository>(SupportRepository);
    discordWebhookService = module.get<DiscordWebhookService>(DiscordWebhookService);
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
      expect(mockDiscordWebhookService.sendSupportTicketNotification).toHaveBeenCalledWith(
        expectedReport,
      );
    });

    it('should throw BadRequestException for announcement report without announcementId', async () => {
      const createReportDto: CreateReportDto = {
        type: ReportType.ANNOUNCEMENT,
        category: AnnouncementReportCategory.INAPPROPRIATE_CONTENT,
        description: 'Test description',
      };

      await expect(service.createReport(createReportDto)).rejects.toThrow(BadRequestException);
    });

    it('should create a USER_FEEDBACK report successfully', async () => {
      const createReportDto: CreateReportDto = {
        type: ReportType.USER_FEEDBACK,
        category: UserFeedbackReportCategory.FEATURE_REQUEST,
        description: 'Test feature request',
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
      expect(mockDiscordWebhookService.sendSupportTicketNotification).toHaveBeenCalledWith(
        expectedReport,
      );
    });

    it('should create an OTHER report successfully', async () => {
      const createReportDto: CreateReportDto = {
        type: ReportType.OTHER,
        category: OtherReportCategory.GENERAL_INQUIRY,
        description: 'Test general inquiry',
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
      expect(mockDiscordWebhookService.sendSupportTicketNotification).toHaveBeenCalledWith(
        expectedReport,
      );
    });

    it('should throw BadRequestException for USER_FEEDBACK with invalid category', async () => {
      const createReportDto: CreateReportDto = {
        type: ReportType.USER_FEEDBACK,
        category: AnnouncementReportCategory.INAPPROPRIATE_CONTENT,
        description: 'Test description',
      };

      await expect(service.createReport(createReportDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for OTHER with invalid category', async () => {
      const createReportDto: CreateReportDto = {
        type: ReportType.OTHER,
        category: TechnicalReportCategory.CONNECTION_ISSUE,
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
    it('should update status successfully and send Discord notification', async () => {
      const oldReport = {
        id: 'test-id',
        status: ReportStatus.PENDING,
        type: ReportType.ANNOUNCEMENT,
        category: AnnouncementReportCategory.INAPPROPRIATE_CONTENT,
        description: 'Test description',
      };

      const updatedReport = {
        id: 'test-id',
        status: ReportStatus.IN_PROGRESS,
        type: ReportType.ANNOUNCEMENT,
        category: AnnouncementReportCategory.INAPPROPRIATE_CONTENT,
        description: 'Test description',
      };

      mockRepository.findById.mockResolvedValue(oldReport);
      mockRepository.update.mockResolvedValue(updatedReport);

      const result = await service.updateStatus('test-id', ReportStatus.IN_PROGRESS);

      expect(result).toEqual(updatedReport);
      expect(mockRepository.findById).toHaveBeenCalledWith('test-id');
      expect(mockRepository.update).toHaveBeenCalledWith('test-id', {
        status: ReportStatus.IN_PROGRESS,
      });
      expect(mockDiscordWebhookService.sendStatusUpdateNotification).toHaveBeenCalledWith(
        updatedReport,
        ReportStatus.PENDING,
        ReportStatus.IN_PROGRESS,
      );
    });

    it('should throw NotFoundException when report not found', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(service.updateStatus('test-id', ReportStatus.IN_PROGRESS)).rejects.toThrow(
        NotFoundException,
      );
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
