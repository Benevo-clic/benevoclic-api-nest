import { Module, forwardRef } from '@nestjs/common';
import { AssociationService } from './services/association.service';
import { AssociationController } from './controllers/association.controller';
import { AssociationDashboardSimpleController } from './controllers/association-dashboard-simple.controller';
import { AssociationRepository } from './repository/association.repository';
import { AssociationStatsSimpleService } from './services/association-stats-simple.service';
import { DatabaseModule } from '../../database/database.module';
import { AnnouncementModule } from '../announcement/announcement.module';
import { VolunteerModule } from '../volunteer/volunteer.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Association } from './entities/association.entity';
import { NotificationsModule } from '../notifications/notifications.module';

import { DateService } from '../../common/services/date.service';

@Module({
  imports: [
    DatabaseModule,
    TypeOrmModule.forFeature([Association]),
    forwardRef(() => AnnouncementModule),
    forwardRef(() => VolunteerModule),
    forwardRef(() => NotificationsModule),
  ],
  controllers: [AssociationController, AssociationDashboardSimpleController],
  providers: [
    AssociationService,
    AssociationRepository,
    AssociationStatsSimpleService,
    DateService,
  ],
  exports: [AssociationService, AssociationStatsSimpleService],
})
export class AssociationModule {}
