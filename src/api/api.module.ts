import { Module } from '@nestjs/common';
import { AnnouncementModule } from './announcement/announcement.module';
import { UserModule } from './user/user.module';
import { AssociationModule } from './association/association.module';
import { VolunteerModule } from './volunteer/volunteer.module';
import { FavoritesAnnouncementModule } from './favorites-announcement/favorites-announcement.module';

@Module({
  imports: [
    AnnouncementModule,
    AssociationModule,
    UserModule,
    VolunteerModule,
    FavoritesAnnouncementModule,
  ],
})
export class ApiModule {}
