import { Module, forwardRef } from '@nestjs/common';
import { VolunteerService } from './services/volunteer.service';
import { VolunteerController } from './controllers/volunteer.controller';
import { VolunteerRepository } from './repository/volunteer.repository';
import { DatabaseModule } from '../../database/database.module';
import { FavoritesAnnouncementModule } from '../favorites-announcement/favorites-announcement.module';
import { AnnouncementModule } from '../announcement/announcement.module';

@Module({
  imports: [DatabaseModule, FavoritesAnnouncementModule, forwardRef(() => AnnouncementModule)],
  controllers: [VolunteerController],
  providers: [VolunteerService, VolunteerRepository],
  exports: [VolunteerRepository],
})
export class VolunteerModule {}
