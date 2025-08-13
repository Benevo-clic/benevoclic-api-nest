import { forwardRef, Module } from '@nestjs/common';
import { UserService } from '../../common/services/user/user.service';
import { UserController } from './controllers/user.controller';
import { ConfigModule } from '@config/config.module';
import { DatabaseModule } from '../../database/database.module';
import { UserRepository } from './repository/user.repository';
import { VolunteerModule } from '../volunteer/volunteer.module';
import { AssociationModule } from '../association/association.module';
import { AwsS3Service } from '../../common/aws/aws-s3.service';
import { SettingsModule } from '../settings/settings.module';

@Module({
  imports: [
    ConfigModule,
    DatabaseModule,
    forwardRef(() => VolunteerModule),
    forwardRef(() => AssociationModule),
    forwardRef(() => SettingsModule),
  ],
  controllers: [UserController],
  providers: [UserService, UserRepository, AwsS3Service],
  exports: [UserService, UserRepository, AwsS3Service],
})
export class UserModule {}
