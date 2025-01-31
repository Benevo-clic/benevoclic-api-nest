import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { AnnouncementRepository } from './repositories/announcement.repository';
import { AnnouncementService } from './services/announcement.service';
import { AnnouncementController } from './controllers/announcement.controller';

@Module({
  imports: [DatabaseModule],
  providers: [AnnouncementRepository, AnnouncementService],
  controllers: [AnnouncementController],
  exports: [AnnouncementService],
})
export class AnnouncementModule {}
