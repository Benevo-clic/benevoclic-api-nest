import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './guards/auth.guard';
import { LoggerService } from './common/services/logger.service';
import { ApiModule } from './api/api.module';
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-redis-store';
import { AppService } from './app.service';
import { HealthController } from './health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    ApiModule,
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        store: redisStore,
        host: configService.get('redis.host'),
        port: configService.get('redis.port'),
        password: configService.get('redis.password'),
        ttl: configService.get('redis.ttl'),
        db: configService.get('redis.db'),
        retryDelayOnFailover: configService.get('redis.retryDelayOnFailover'),
        enableReadyCheck: configService.get('redis.enableReadyCheck'),
        maxRetriesPerRequest: configService.get('redis.maxRetriesPerRequest'),
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [HealthController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    LoggerService,
    AppService,
  ],
  exports: [LoggerService],
})
export class AppModule {}
