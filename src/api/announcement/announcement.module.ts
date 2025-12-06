import { forwardRef, Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { AnnouncementService } from './services/announcement.service';
import { AnnouncementController } from './controllers/announcement.controller';
import { AnnouncementRepository } from './repositories/announcement.repository';
import { UserModule } from '../user/user.module';
import { FavoritesAnnouncementModule } from '../favorites-announcement/favorites-announcement.module';
import { VolunteerModule } from '../volunteer/volunteer.module';
import { AssociationModule } from '../association/association.module';
import { SettingsModule } from '../settings/settings.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Announcement } from './entities/announcement.entity';

@Module({
  imports: [
    DatabaseModule,
    TypeOrmModule.forFeature([Announcement]),
    UserModule,
    forwardRef(() => VolunteerModule),
    forwardRef(() => FavoritesAnnouncementModule),
    forwardRef(() => AssociationModule),
    SettingsModule,
    forwardRef(() => NotificationsModule),
  ],
  providers: [AnnouncementRepository, AnnouncementService],
  controllers: [AnnouncementController],
  exports: [AnnouncementService, AnnouncementRepository],
})
export class AnnouncementModule { }

