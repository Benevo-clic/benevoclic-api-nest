import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';
import { PrometheusService } from '../prometheus/prometheus.service';

describe('HealthController', () => {
  let controller: HealthController;
  let prometheusService: PrometheusService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: PrometheusService,
          useValue: {
            recordApiError: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
    prometheusService = module.get<PrometheusService>(PrometheusService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('check', () => {
    it('should return health status', () => {
      const result = controller.check();

      expect(result).toEqual({
        status: 'ok',
        timestamp: expect.any(String),
        uptime: expect.any(Number),
        environment: expect.any(String),
      });
      expect(prometheusService.recordApiError).toHaveBeenCalledWith(
        '/health',
        'health_check_success',
      );
    });

    it('should include valid timestamp', () => {
      const result = controller.check();
      const timestamp = new Date(result.timestamp);

      expect(timestamp.getTime()).toBeGreaterThan(0);
      expect(timestamp).toBeInstanceOf(Date);
    });

    it('should include valid uptime', () => {
      const result = controller.check();

      expect(result.uptime).toBeGreaterThan(0);
      expect(typeof result.uptime).toBe('number');
    });

    it('should include environment', () => {
      const result = controller.check();

      expect(result.environment).toBeDefined();
      expect(typeof result.environment).toBe('string');
    });
  });
});
