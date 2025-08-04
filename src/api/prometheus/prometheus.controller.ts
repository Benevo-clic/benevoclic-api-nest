import { Controller, Get, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Public } from 'src/common/decorators/public.decorator';
import { Response } from 'express';
import { PrometheusService } from './prometheus.service';

@ApiTags('Prometheus')
@Controller('metrics')
export class PrometheusController {
  constructor(private readonly prometheusService: PrometheusService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Expose Prometheus metrics' })
  @ApiResponse({
    status: 200,
    description: 'Prometheus metrics in text format',
    content: {
      'text/plain': {
        schema: {
          type: 'string',
          example:
            '# HELP http_requests_total Total number of HTTP requests\n# TYPE http_requests_total counter\nhttp_requests_total{method="GET",path="/health"} 42',
        },
      },
    },
  })
  async getMetrics(@Res() res: Response) {
    const metrics = await this.prometheusService.getMetrics();
    res.set('Content-Type', 'text/plain');
    res.send(metrics);
  }
}
