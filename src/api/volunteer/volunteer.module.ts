import { Module } from '@nestjs/common';
import { VolunteerService } from './services/volunteer.service';
import { VolunteerController } from './controllers/volunteer.controller';
import { VolunteerRepository } from './repository/volunteer.repository';
import { DatabaseModule } from '../../database/database.module';
import { UserService } from '../../common/services/user/user.service';

@Module({
  imports: [DatabaseModule],
  controllers: [VolunteerController],
  providers: [VolunteerService, VolunteerRepository, UserService],
})
export class VolunteerModule {}
