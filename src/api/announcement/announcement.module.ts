import { forwardRef, Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { AnnouncementService } from './services/announcement.service';
import { AnnouncementController } from './controllers/announcement.controller';
import { AnnouncementRepository } from './repositories/announcement.repository';
import { UserModule } from '../user/user.module';
import { FavoritesAnnouncementModule } from '../favorites-announcement/favorites-announcement.module';
import { UserService } from '../../common/services/user/user.service';
import { VolunteerModule } from '../volunteer/volunteer.module';

@Module({
  imports: [
    DatabaseModule,
    UserModule,
    forwardRef(() => FavoritesAnnouncementModule),
    forwardRef(() => VolunteerModule),
  ],
  providers: [AnnouncementRepository, AnnouncementService, UserService],
  controllers: [AnnouncementController],
  exports: [AnnouncementService, AnnouncementRepository],
})
export class AnnouncementModule {}
