import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Public } from 'src/common/decorators/public.decorator';
import { PrometheusService } from '../prometheus/prometheus.service';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly prometheusService: PrometheusService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({
    status: 200,
    description: 'API is healthy',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'ok' },
        timestamp: { type: 'string', example: '2024-01-15T10:30:00.000Z' },
        uptime: { type: 'number', example: 12345 },
        environment: { type: 'string', example: 'production' },
      },
    },
  })
  check() {
    // Enregistrer une métrique personnalisée pour les health checks
    this.prometheusService.recordApiError('/health', 'health_check_success');

    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
    };
  }
}
