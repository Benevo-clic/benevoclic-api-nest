import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { PrometheusService } from '../../api/prometheus/prometheus.service';

@Injectable()
export class PrometheusMiddleware implements NestMiddleware {
  constructor(private readonly prometheusService: PrometheusService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const startTime = Date.now();
    const method = req.method;
    const path = req.route?.path || req.path;

    // Ignorer les métriques Prometheus pour éviter les boucles infinies
    if (path === '/metrics') {
      return next();
    }

    // Démarrer le tracking de la requête
    this.prometheusService.startHttpRequest(method, path);

    // Intercepter la fin de la réponse
    res.on('finish', () => {
      const duration = (Date.now() - startTime) / 1000; // Convertir en secondes
      const status = res.statusCode;

      // Enregistrer les métriques
      this.prometheusService.recordHttpRequest(method, path, status, duration);
      this.prometheusService.endHttpRequest(method, path);
    });

    next();
  }
}
