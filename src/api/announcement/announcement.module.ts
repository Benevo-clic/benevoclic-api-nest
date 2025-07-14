import { forwardRef, Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { AnnouncementService } from './services/announcement.service';
import { AnnouncementController } from './controllers/announcement.controller';
import { AnnouncementRepository } from './repositories/announcement.repository';
import { UserModule } from '../user/user.module';
import { FavoritesAnnouncementModule } from '../favorites-announcement/favorites-announcement.module';
import { UserService } from '../../common/services/user/user.service';
import { VolunteerModule } from '../volunteer/volunteer.module';
import { AssociationModule } from '../association/association.module';
import { AwsS3Service } from '../../common/aws/aws-s3.service';

@Module({
  imports: [
    DatabaseModule,
    UserModule,
    forwardRef(() => VolunteerModule),
    forwardRef(() => FavoritesAnnouncementModule),
    forwardRef(() => AssociationModule),
  ],
  providers: [AnnouncementRepository, AnnouncementService, UserService, AwsS3Service],
  controllers: [AnnouncementController],
  exports: [AnnouncementService, AnnouncementRepository, AwsS3Service],
})
export class AnnouncementModule {}
