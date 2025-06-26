import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { AnnouncementService } from './services/announcement.service';
import { AnnouncementController } from './controllers/announcement.controller';
import { AnnouncementRepository } from './repositories/announcement.repository';
import { UserModule } from '../user/user.module';

@Module({
  imports: [DatabaseModule, UserModule],
  providers: [AnnouncementRepository, AnnouncementService],
  controllers: [AnnouncementController],
  exports: [AnnouncementService, AnnouncementRepository],
})
export class AnnouncementModule {}
