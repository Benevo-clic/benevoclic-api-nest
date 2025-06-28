import { Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class AppService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async get(): Promise<any> {
    return await this.cacheManager.get('toto');
  }

  async delete(id: string): Promise<void> {
    if (!id) {
      throw new Error('ID is required to delete an entry');
    }
    await this.cacheManager.del(id);
  }

  async getHealth(): Promise<{ status: string; timestamp: string; cache: string }> {
    try {
      // Test cache connection
      await this.cacheManager.set('health-check', 'ok', 10);
      const cacheStatus = await this.cacheManager.get('health-check');

      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        cache: cacheStatus === 'ok' ? 'connected' : 'error',
      };
    } catch (error) {
      return {
        status: 'error',
        timestamp: new Date().toISOString(),
        cache: 'disconnected',
      };
    }
  }
}
