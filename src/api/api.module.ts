import { Module } from '@nestjs/common';
import { AnnouncementModule } from './announcement/announcement.module';
import { UserModule } from './user/user.module';
import { AssociationModule } from './association/association.module';

@Module({
  imports: [AnnouncementModule, AssociationModule, UserModule],
})
export class ApiModule {}
