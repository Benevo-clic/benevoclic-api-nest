import { Module, forwardRef } from '@nestjs/common';
import { AssociationService } from './services/association.service';
import { AssociationController } from './controllers/association.controller';
import { AssociationDashboardSimpleController } from './controllers/association-dashboard-simple.controller';
import { AssociationRepository } from './repository/association.repository';
import { AssociationStatsSimpleService } from './services/association-stats-simple.service';
import { DatabaseModule } from '../../database/database.module';
import { AnnouncementModule } from '../announcement/announcement.module';
import { VolunteerModule } from '../volunteer/volunteer.module';

@Module({
  imports: [
    DatabaseModule,
    forwardRef(() => AnnouncementModule),
    forwardRef(() => VolunteerModule),
  ],
  controllers: [AssociationController, AssociationDashboardSimpleController],
  providers: [AssociationService, AssociationRepository, AssociationStatsSimpleService],
  exports: [AssociationService, AssociationStatsSimpleService],
})
export class AssociationModule {}
