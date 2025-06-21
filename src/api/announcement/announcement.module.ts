import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { AnnouncementService } from './services/announcement.service';
import { AnnouncementController } from './controllers/announcement.controller';
import { AnnouncementRepository } from './repositories/announcement.repository';
import { UserService } from '../../common/services/user/user.service';

@Module({
  imports: [DatabaseModule],
  providers: [AnnouncementRepository, AnnouncementService, UserService],
  controllers: [AnnouncementController],
})
export class AnnouncementModule {}
