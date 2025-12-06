import { forwardRef, Module } from '@nestjs/common';
import { FavoritesAnnouncementService } from './services/favorites-announcement.service';
import { FavoritesAnnouncementController } from './controllers/favorites-announcement.controller';
import { FavoritesAnnouncementRepository } from './repository/favorites-announcement.repository';
import { DatabaseModule } from '../../database/database.module';
import { AnnouncementModule } from '../announcement/announcement.module';
import { UserModule } from '../user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FavoritesAnnouncement } from './entities/favorites-announcement.entity';

@Module({
  imports: [
    DatabaseModule,
    TypeOrmModule.forFeature([FavoritesAnnouncement]),
    forwardRef(() => AnnouncementModule),
    forwardRef(() => UserModule),
  ],
  controllers: [FavoritesAnnouncementController],
  providers: [FavoritesAnnouncementService, FavoritesAnnouncementRepository],
  exports: [FavoritesAnnouncementService],
})
export class FavoritesAnnouncementModule { }
