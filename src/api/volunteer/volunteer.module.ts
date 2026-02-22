import { Module, forwardRef } from '@nestjs/common';
import { VolunteerService } from './services/volunteer.service';
import { VolunteerController } from './controllers/volunteer.controller';
import { VolunteerRepository } from './repository/volunteer.repository';
import { DatabaseModule } from '../../database/database.module';
import { FavoritesAnnouncementModule } from '../favorites-announcement/favorites-announcement.module';
import { AnnouncementModule } from '../announcement/announcement.module';
import { AssociationModule } from '../association/association.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Volunteer } from './entities/volunteer.entity';

@Module({
  imports: [
    DatabaseModule,
    TypeOrmModule.forFeature([Volunteer]),
    forwardRef(() => FavoritesAnnouncementModule),
    forwardRef(() => AnnouncementModule),
    forwardRef(() => AssociationModule),
  ],
  controllers: [VolunteerController],
  providers: [VolunteerService, VolunteerRepository],
  exports: [VolunteerService, VolunteerRepository],
})
export class VolunteerModule {}
