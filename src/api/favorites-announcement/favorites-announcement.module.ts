import { forwardRef, Module } from '@nestjs/common';
import { FavoritesAnnouncementService } from './services/favorites-announcement.service';
import { FavoritesAnnouncementController } from './controllers/favorites-announcement.controller';
import { FavoritesAnnouncementRepository } from './repository/favorites-announcement.repository';
import { DatabaseModule } from '../../database/database.module';
import { AnnouncementModule } from '../announcement/announcement.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [DatabaseModule, forwardRef(() => AnnouncementModule), forwardRef(() => UserModule)],
  controllers: [FavoritesAnnouncementController],
  providers: [FavoritesAnnouncementService, FavoritesAnnouncementRepository],
  exports: [FavoritesAnnouncementService],
})
export class FavoritesAnnouncementModule {}
