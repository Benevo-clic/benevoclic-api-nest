import { forwardRef, Module } from '@nestjs/common';
import { UserService } from '../../common/services/user/user.service';
import { UserController } from './controllers/user.controller';
import { ConfigModule } from '@config/config.module';
import { DatabaseModule } from '../../database/database.module';
import { UserRepository } from './repository/user.repository';
import { VolunteerModule } from '../volunteer/volunteer.module';

@Module({
  imports: [ConfigModule, DatabaseModule, forwardRef(() => VolunteerModule)],
  controllers: [UserController],
  providers: [UserService, UserRepository],
  exports: [UserService, UserRepository],
})
export class UserModule {}
