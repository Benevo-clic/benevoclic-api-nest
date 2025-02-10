import { Module } from '@nestjs/common';
import { FavoritesAnnouncementService } from './services/favorites-announcement.service';
import { FavoritesAnnouncementController } from './controllers/favorites-announcement.controller';
import { FavoritesAnnouncementRepository } from './repository/favorites-announcement.repository';
import { DatabaseModule } from '../../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [FavoritesAnnouncementController],
  providers: [FavoritesAnnouncementService, FavoritesAnnouncementRepository],
})
export class FavoritesAnnouncementModule {}
