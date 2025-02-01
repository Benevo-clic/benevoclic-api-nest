import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { AnnouncementRepository } from './announcement.repository';
import { AnnouncementService } from './announcement.service';
import { AnnouncementController } from './announcement.controller';

@Module({
  imports: [DatabaseModule],
  providers: [AnnouncementRepository, AnnouncementService],
  controllers: [AnnouncementController],
})
export class AnnouncementModule {}
