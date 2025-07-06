import { Module, forwardRef } from '@nestjs/common';
import { AssociationService } from './services/association.service';
import { AssociationController } from './controllers/association.controller';
import { AssociationRepository } from './repository/association.repository';
import { DatabaseModule } from '../../database/database.module';
import { AnnouncementModule } from '../announcement/announcement.module';
import { VolunteerModule } from '../volunteer/volunteer.module';

@Module({
  imports: [
    DatabaseModule,
    forwardRef(() => AnnouncementModule),
    forwardRef(() => VolunteerModule),
  ],
  controllers: [AssociationController],
  providers: [AssociationService, AssociationRepository],
  exports: [AssociationService],
})
export class AssociationModule {}
