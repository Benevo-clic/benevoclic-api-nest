import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { DatabaseModule } from './database/database.module';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './guards/auth.guard';
import { LoggerService } from './common/services/logger.service';
import { OrphanCleanupService } from './common/services/orphan-cleanup.service';
import { ApiModule } from './api/api.module';
import { FavoritesAnnouncementModule } from './api/favorites-announcement/favorites-announcement.module';
import { AnnouncementModule } from './api/announcement/announcement.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    DatabaseModule,
    ApiModule,
    forwardRef(() => FavoritesAnnouncementModule),
    forwardRef(() => AnnouncementModule),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    LoggerService,
    OrphanCleanupService,
  ],
  exports: [LoggerService, OrphanCleanupService],
})
export class AppModule {}
