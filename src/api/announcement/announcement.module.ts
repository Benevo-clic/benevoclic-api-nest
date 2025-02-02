import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { AnnouncementService } from './services/announcement.service';
import { AnnouncementController } from './controllers/announcement.controller';
import { AnnouncementRepository } from './repositories/announcement.repository';

@Module({
  imports: [DatabaseModule],
  providers: [AnnouncementRepository, AnnouncementService],
  controllers: [AnnouncementController],
})
export class AnnouncementModule {}
