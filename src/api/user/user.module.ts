import { Module } from '@nestjs/common';
import { UserService } from '../../common/services/user/user.service';
import { UserController } from './controllers/user.controller';
import { ConfigModule } from '@config/config.module';
import { UserRepository } from './repository/user.repository';
import { DatabaseModule } from '../../database/database.module';

@Module({
  imports: [ConfigModule, DatabaseModule],
  controllers: [UserController],
  providers: [UserService, UserRepository],
  exports: [UserService],
})
export class UserModule {}
