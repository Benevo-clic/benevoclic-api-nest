import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { PrometheusModule } from '../prometheus/prometheus.module';

@Module({
  imports: [PrometheusModule],
  controllers: [HealthController],
})
export class HealthModule {}
