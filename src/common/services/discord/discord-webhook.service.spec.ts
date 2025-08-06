import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { DiscordWebhookService } from './discord-webhook.service';
import axios from 'axios';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('DiscordWebhookService', () => {
  let service: DiscordWebhookService;
  let mockConfigService: Partial<ConfigService>;

  beforeEach(async () => {
    mockConfigService = {
      get: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DiscordWebhookService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<DiscordWebhookService>(DiscordWebhookService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendSupportTicketNotification', () => {
    const mockReport = {
      id: 'test-id',
      type: 'ANNOUNCEMENT',
      category: 'INAPPROPRIATE_CONTENT',
      description: 'Test description',
      userEmail: 'test@example.com',
      pageUrl: 'https://example.com',
      createdAt: new Date(),
    };

    it('should send notification when webhook URL is configured', async () => {
      // Set up the mock before creating the service
      mockConfigService.get = jest.fn().mockReturnValue('https://discord.com/api/webhooks/test');

      // Recreate the service with the mocked config
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          DiscordWebhookService,
          {
            provide: ConfigService,
            useValue: mockConfigService,
          },
        ],
      }).compile();

      const serviceWithWebhook = module.get<DiscordWebhookService>(DiscordWebhookService);
      mockedAxios.post.mockResolvedValue({ status: 200 });

      await serviceWithWebhook.sendSupportTicketNotification(mockReport);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        'https://discord.com/api/webhooks/test',
        expect.objectContaining({
          embeds: expect.arrayContaining([
            expect.objectContaining({
              title: expect.stringContaining('Nouveau ticket de support #test-id'),
              description: expect.stringContaining("Signalement d'annonce"),
            }),
          ]),
          username: 'Benevoclic Support Bot',
        }),
        expect.objectContaining({
          headers: { 'Content-Type': 'application/json' },
          timeout: 10000,
        }),
      );
    });

    it('should not send notification when webhook URL is not configured', async () => {
      // Set up the mock to return null before creating the service
      mockConfigService.get = jest.fn().mockReturnValue(null);

      // Recreate the service with the mocked config
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          DiscordWebhookService,
          {
            provide: ConfigService,
            useValue: mockConfigService,
          },
        ],
      }).compile();

      const serviceWithoutWebhook = module.get<DiscordWebhookService>(DiscordWebhookService);

      await serviceWithoutWebhook.sendSupportTicketNotification(mockReport);

      expect(mockedAxios.post).not.toHaveBeenCalled();
    });

    it('should handle axios errors gracefully', async () => {
      // Set up the mock before creating the service
      mockConfigService.get = jest.fn().mockReturnValue('https://discord.com/api/webhooks/test');

      // Recreate the service with the mocked config
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          DiscordWebhookService,
          {
            provide: ConfigService,
            useValue: mockConfigService,
          },
        ],
      }).compile();

      const serviceWithWebhook = module.get<DiscordWebhookService>(DiscordWebhookService);
      mockedAxios.post.mockRejectedValue(new Error('Network error'));

      // Should not throw
      await expect(
        serviceWithWebhook.sendSupportTicketNotification(mockReport),
      ).resolves.not.toThrow();
    });
  });

  describe('sendStatusUpdateNotification', () => {
    const mockReport = {
      id: 'test-id',
      type: 'TECHNICAL',
      category: 'CONNECTION_ISSUE',
      description: 'Test description',
      userEmail: 'test@example.com',
      pageUrl: 'https://example.com',
      createdAt: new Date(),
    };

    it('should send status update notification when webhook URL is configured', async () => {
      // Set up the mock before creating the service
      mockConfigService.get = jest.fn().mockReturnValue('https://discord.com/api/webhooks/test');

      // Recreate the service with the mocked config
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          DiscordWebhookService,
          {
            provide: ConfigService,
            useValue: mockConfigService,
          },
        ],
      }).compile();

      const serviceWithWebhook = module.get<DiscordWebhookService>(DiscordWebhookService);
      mockedAxios.post.mockResolvedValue({ status: 200 });

      await serviceWithWebhook.sendStatusUpdateNotification(mockReport, 'PENDING', 'IN_PROGRESS');

      expect(mockedAxios.post).toHaveBeenCalledWith(
        'https://discord.com/api/webhooks/test',
        expect.objectContaining({
          embeds: expect.arrayContaining([
            expect.objectContaining({
              title: expect.stringContaining('Mise à jour du ticket #test-id'),
              description: expect.stringContaining('PENDING → **IN_PROGRESS**'),
            }),
          ]),
          username: 'Benevoclic Support Bot',
        }),
        expect.objectContaining({
          headers: { 'Content-Type': 'application/json' },
          timeout: 10000,
        }),
      );
    });

    it('should not send notification when webhook URL is not configured', async () => {
      // Set up the mock to return null before creating the service
      mockConfigService.get = jest.fn().mockReturnValue(null);

      // Recreate the service with the mocked config
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          DiscordWebhookService,
          {
            provide: ConfigService,
            useValue: mockConfigService,
          },
        ],
      }).compile();

      const serviceWithoutWebhook = module.get<DiscordWebhookService>(DiscordWebhookService);

      await serviceWithoutWebhook.sendStatusUpdateNotification(mockReport, 'PENDING', 'RESOLVED');

      expect(mockedAxios.post).not.toHaveBeenCalled();
    });

    it('should handle axios errors gracefully', async () => {
      // Set up the mock before creating the service
      mockConfigService.get = jest.fn().mockReturnValue('https://discord.com/api/webhooks/test');

      // Recreate the service with the mocked config
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          DiscordWebhookService,
          {
            provide: ConfigService,
            useValue: mockConfigService,
          },
        ],
      }).compile();

      const serviceWithWebhook = module.get<DiscordWebhookService>(DiscordWebhookService);
      mockedAxios.post.mockRejectedValue(new Error('Network error'));

      // Should not throw
      await expect(
        serviceWithWebhook.sendStatusUpdateNotification(mockReport, 'PENDING', 'RESOLVED'),
      ).resolves.not.toThrow();
    });
  });
});
