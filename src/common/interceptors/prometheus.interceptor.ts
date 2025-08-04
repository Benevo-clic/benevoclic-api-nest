import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { PrometheusService } from '../../api/prometheus/prometheus.service';

@Injectable()
export class PrometheusInterceptor implements NestInterceptor {
  constructor(private readonly prometheusService: PrometheusService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const method = request.method;
    const path = request.route?.path || request.path;

    // Ignorer les métriques Prometheus pour éviter les boucles infinies
    if (path === '/metrics') {
      return next.handle();
    }

    const startTime = Date.now();

    // Démarrer le tracking de la requête
    this.prometheusService.startHttpRequest(method, path);

    return next.handle().pipe(
      tap({
        next: () => {
          const duration = (Date.now() - startTime) / 1000; // Convertir en secondes
          const status = response.statusCode;

          // Enregistrer les métriques
          this.prometheusService.recordHttpRequest(method, path, status, duration);
          this.prometheusService.endHttpRequest(method, path);
        },
        error: error => {
          const duration = (Date.now() - startTime) / 1000;
          const status = error.status || 500;

          // Enregistrer les métriques d'erreur
          this.prometheusService.recordHttpRequest(method, path, status, duration);
          this.prometheusService.endHttpRequest(method, path);

          // Enregistrer l'erreur spécifique
          this.prometheusService.recordApiError(path, error.name || 'UnknownError');
        },
      }),
    );
  }
}
