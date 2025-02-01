import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MongoConfig {
  constructor(private configService: ConfigService) {}

  get uri(): string {
    return this.configService.get<string>('MONGODB_URL');
  }

  get dbName(): string {
    return this.configService.get<string>('MONGODB_DB_NAME');
  }

  host(): string {
    return this.configService.get<string>('MONGODB_HOST');
  }

  password(): string {
    return this.configService.get<string>('MONGODB_PASSWORD');
  }

  port(): number {
    return this.configService.get<number>('MONGODB_PORT');
  }

  maxIdleTimeMS(): number {
    return this.configService.get<number>('MONGODB_MAX_IDLE_TIME_MS');
  }

  maxPoolSize(): number {
    return this.configService.get<number>('MONGODB_MAX_POOL_SIZE');
  }
}
