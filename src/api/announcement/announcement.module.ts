import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { DatabaseModule } from '../../database/database.module';
import { AnnouncementService } from './services/announcement.service';
import { AnnouncementController } from './controllers/announcement.controller';
import { AnnouncementRepository } from './repositories/announcement.repository';
import { AnnouncementCacheSubscriber } from './subscribers/announcement-cache.subscriber';
import { UserModule } from '../user/user.module';

@Module({
  imports: [DatabaseModule, UserModule, EventEmitterModule.forRoot()],
  providers: [AnnouncementRepository, AnnouncementService, AnnouncementCacheSubscriber],
  controllers: [AnnouncementController],
  exports: [AnnouncementService, AnnouncementRepository],
})
export class AnnouncementModule {}
