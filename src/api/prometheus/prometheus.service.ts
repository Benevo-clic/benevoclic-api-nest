import { Injectable, OnModuleInit } from '@nestjs/common';
import { collectDefaultMetrics, Counter, Gauge, Histogram, register } from 'prom-client';

@Injectable()
export class PrometheusService implements OnModuleInit {
  private httpRequestsTotal: Counter;
  private httpRequestDuration: Histogram;
  private httpRequestsInProgress: Gauge;
  private activeConnections: Gauge;
  private memoryUsage: Gauge;
  private cpuUsage: Gauge;
  private loginAttemptsTotal: Counter;
  private apiErrorsTotal: Counter;
  private databaseOperationDuration: Histogram;

  onModuleInit() {
    collectDefaultMetrics();

    this.httpRequestsTotal = new Counter({
      name: 'http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'path', 'status'],
    });

    this.httpRequestDuration = new Histogram({
      name: 'http_request_duration_seconds',
      help: 'HTTP request duration in seconds',
      labelNames: ['method', 'path'],
      buckets: [0.1, 0.5, 1, 2, 5],
    });

    this.httpRequestsInProgress = new Gauge({
      name: 'http_requests_in_progress',
      help: 'Number of HTTP requests currently in progress',
      labelNames: ['method', 'path'],
    });

    this.activeConnections = new Gauge({
      name: 'active_connections',
      help: 'Number of active connections',
    });

    this.memoryUsage = new Gauge({
      name: 'memory_usage_bytes',
      help: 'Memory usage in bytes',
      labelNames: ['type'],
    });

    this.cpuUsage = new Gauge({
      name: 'cpu_usage_percent',
      help: 'CPU usage percentage',
    });

    this.loginAttemptsTotal = new Counter({
      name: 'login_attempts_total',
      help: 'Total number of login attempts',
      labelNames: ['success', 'provider'],
    });

    this.apiErrorsTotal = new Counter({
      name: 'api_errors_total',
      help: 'Total number of API errors',
      labelNames: ['endpoint', 'error_type'],
    });

    this.databaseOperationDuration = new Histogram({
      name: 'database_operation_duration_seconds',
      help: 'Database operation duration in seconds',
      labelNames: ['operation'],
      buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5],
    });

    setInterval(() => {
      this.updateSystemMetrics();
    }, 30000);
  }

  private updateSystemMetrics() {
    const memUsage = process.memoryUsage();

    this.memoryUsage.set({ type: 'rss' }, memUsage.rss);
    this.memoryUsage.set({ type: 'heapTotal' }, memUsage.heapTotal);
    this.memoryUsage.set({ type: 'heapUsed' }, memUsage.heapUsed);
    this.memoryUsage.set({ type: 'external' }, memUsage.external);
  }

  recordHttpRequest(method: string, path: string, status: number, duration: number) {
    this.httpRequestsTotal.inc({ method, path, status: status.toString() });
    this.httpRequestDuration.observe({ method, path }, duration);
  }

  startHttpRequest(method: string, path: string) {
    this.httpRequestsInProgress.inc({ method, path });
  }

  endHttpRequest(method: string, path: string) {
    this.httpRequestsInProgress.dec({ method, path });
  }

  setActiveConnections(count: number) {
    this.activeConnections.set(count);
  }

  setCpuUsage(percentage: number) {
    this.cpuUsage.set(percentage);
  }

  async getMetrics(): Promise<string> {
    return register.metrics();
  }

  recordLoginAttempt(success: boolean, provider: string = 'unknown') {
    this.loginAttemptsTotal.inc({ success: success.toString(), provider });
  }

  recordApiError(endpoint: string, errorType: string) {
    this.apiErrorsTotal.inc({ endpoint, error_type: errorType });
  }

  recordDatabaseOperation(operation: string, duration: number) {
    this.databaseOperationDuration.observe({ operation }, duration);
  }
}
