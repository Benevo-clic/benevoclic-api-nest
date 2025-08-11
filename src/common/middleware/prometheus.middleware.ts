import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { PrometheusService } from '../../api/prometheus/prometheus.service';

@Injectable()
export class PrometheusMiddleware implements NestMiddleware {
  constructor(private readonly prometheusService: PrometheusService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const startTime = Date.now();
    const method = req.method;
    const path = req.route?.path || req.path;

    if (path === '/metrics') {
      return next();
    }

    this.prometheusService.startHttpRequest(method, path);

    res.on('finish', () => {
      const duration = (Date.now() - startTime) / 1000;
      const status = res.statusCode;

      this.prometheusService.recordHttpRequest(method, path, status, duration);
      this.prometheusService.endHttpRequest(method, path);
    });

    next();
  }
}
