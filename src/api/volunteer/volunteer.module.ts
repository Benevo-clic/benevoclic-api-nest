import { Module } from '@nestjs/common';
import { VolunteerService } from './services/volunteer.service';
import { VolunteerController } from './controllers/volunteer.controller';
import { VolunteerRepository } from './repository/volunteer.repository';
import { DatabaseModule } from '../../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [VolunteerController],
  providers: [VolunteerService, VolunteerRepository],
})
export class VolunteerModule {}
