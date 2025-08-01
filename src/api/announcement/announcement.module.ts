import { forwardRef, Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { AnnouncementService } from './services/announcement.service';
import { AnnouncementController } from './controllers/announcement.controller';
import { AnnouncementRepository } from './repositories/announcement.repository';
import { UserModule } from '../user/user.module';
import { FavoritesAnnouncementModule } from '../favorites-announcement/favorites-announcement.module';
import { VolunteerModule } from '../volunteer/volunteer.module';
import { AssociationModule } from '../association/association.module';

@Module({
  imports: [
    DatabaseModule,
    UserModule,
    forwardRef(() => VolunteerModule),
    forwardRef(() => FavoritesAnnouncementModule),
    forwardRef(() => AssociationModule),
  ],
  providers: [AnnouncementRepository, AnnouncementService],
  controllers: [AnnouncementController],
  exports: [AnnouncementService, AnnouncementRepository],
})
export class AnnouncementModule {}
