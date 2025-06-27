import { Injectable } from '@nestjs/common';
import { FavoritesAnnouncementRepository } from '../repository/favorites-announcement.repository';
import { FavoritesAnnouncement } from '../entities/favorites-announcement.entity';
import { AnnouncementService } from '../../announcement/services/announcement.service';
import { Announcement } from 'src/api/announcement/entities/announcement.entity';

@Injectable()
export class FavoritesAnnouncementService {
  constructor(
    private readonly favoritesAnnouncementRepository: FavoritesAnnouncementRepository,
    private readonly announcementService: AnnouncementService,
  ) {}

  async create(favoritesAnnouncement: FavoritesAnnouncement) {
    const _favoritesAnnouncement = await this.findByVolunteerIdAndAnnouncementId(
      favoritesAnnouncement.volunteerId,
      favoritesAnnouncement.announcementId,
    );
    if (_favoritesAnnouncement) {
      throw new Error('Favorite announcement already exists');
    }
    return this.favoritesAnnouncementRepository.create({
      ...favoritesAnnouncement,
    });
  }

  async findAll() {
    return this.favoritesAnnouncementRepository.findAll();
  }

  async removeByVolunteerIdAndAnnouncementId(volunteerId: string, announcementId: string) {
    return this.favoritesAnnouncementRepository.removeByVolunteerIdAndAnnouncementId(
      volunteerId,
      announcementId,
    );
  }

  async removeByVolunteerId(volunteerId: string) {
    return this.favoritesAnnouncementRepository.removeByVolunteerId(volunteerId);
  }

  async removeByAnnouncementId(announcementId: string) {
    return this.favoritesAnnouncementRepository.removeByAnnouncementId(announcementId);
  }

  async findAllByVolunteerId(volunteerId: string) {
    return this.favoritesAnnouncementRepository.findAllByVolunteerId(volunteerId);
  }

  async findAllByAnnouncementId(announcementId: string) {
    return this.favoritesAnnouncementRepository.findAllByAnnouncementId(announcementId);
  }

  async findByVolunteerIdAndAnnouncementId(volunteerId: string, announcementId: string) {
    return this.favoritesAnnouncementRepository.findByVolunteerIdAndAnnouncementId(
      volunteerId,
      announcementId,
    );
  }

  async findByVolunteerIdAllFavoritesAnnouncement(volunteerId: string): Promise<Announcement[]> {
    const favorites = await this.favoritesAnnouncementRepository.findAllByVolunteerId(volunteerId);
    console.log(`Favorites for volunteer ${volunteerId}:`, favorites);
    return await Promise.all(
      favorites.map(async favorite => {
        return await this.announcementService.findById(favorite.announcementId);
      }),
    );
  }
}
