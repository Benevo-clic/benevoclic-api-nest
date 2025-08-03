import {
  Injectable,
  Logger,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { FavoritesAnnouncementRepository } from '../repository/favorites-announcement.repository';
import { FavoritesAnnouncement } from '../entities/favorites-announcement.entity';
import { AnnouncementService } from '../../announcement/services/announcement.service';
import { Announcement } from '../../announcement/entities/announcement.entity';

@Injectable()
export class FavoritesAnnouncementService {
  private readonly logger = new Logger(FavoritesAnnouncementService.name);
  constructor(
    private readonly favoritesAnnouncementRepository: FavoritesAnnouncementRepository,
    private readonly announcementService: AnnouncementService,
  ) {}

  async create(favoritesAnnouncement: FavoritesAnnouncement) {
    try {
      const _favoritesAnnouncement = await this.findByVolunteerIdAndAnnouncementId(
        favoritesAnnouncement.volunteerId,
        favoritesAnnouncement.announcementId,
      );
      if (_favoritesAnnouncement) {
        this.logger.error(
          'Favorite announcement already exists',
          JSON.stringify(favoritesAnnouncement),
        );
        throw new BadRequestException('Favorite announcement already exists');
      }
      return await this.favoritesAnnouncementRepository.create({
        ...favoritesAnnouncement,
      });
    } catch (error) {
      this.logger.error('Erreur lors de la création du favori', error.stack);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Erreur lors de la création du favori');
    }
  }

  async findAll() {
    try {
      return await this.favoritesAnnouncementRepository.findAll();
    } catch (error) {
      this.logger.error('Erreur lors de la récupération des favoris', error.stack);
      throw new InternalServerErrorException('Erreur lors de la récupération des favoris');
    }
  }

  async removeByVolunteerIdAndAnnouncementId(volunteerId: string, announcementId: string) {
    try {
      return await this.favoritesAnnouncementRepository.removeByVolunteerIdAndAnnouncementId(
        volunteerId,
        announcementId,
      );
    } catch (error) {
      this.logger.error('Erreur lors de la suppression du favori', error.stack);
      throw new InternalServerErrorException('Erreur lors de la suppression du favori');
    }
  }

  async removeByVolunteerId(volunteerId: string) {
    try {
      return await this.favoritesAnnouncementRepository.removeByVolunteerId(volunteerId);
    } catch (error) {
      this.logger.error('Erreur lors de la suppression des favoris du bénévole', error.stack);
      throw new InternalServerErrorException(
        'Erreur lors de la suppression des favoris du bénévole',
      );
    }
  }

  async removeByAnnouncementId(announcementId: string) {
    try {
      return await this.favoritesAnnouncementRepository.removeByAnnouncementId(announcementId);
    } catch (error) {
      this.logger.error("Erreur lors de la suppression des favoris de l'annonce", error.stack);
      throw new InternalServerErrorException(
        "Erreur lors de la suppression des favoris de l'annonce",
      );
    }
  }

  async findAllByVolunteerId(volunteerId: string) {
    try {
      return await this.favoritesAnnouncementRepository.findAllByVolunteerId(volunteerId);
    } catch (error) {
      this.logger.error('Erreur lors de la récupération des favoris du bénévole', error.stack);
      throw new InternalServerErrorException(
        'Erreur lors de la récupération des favoris du bénévole',
      );
    }
  }

  async findAllFavoritesAnnouncementsByVolunteerId(
    volunteerId: string,
  ): Promise<(Announcement & { isFavorite: true })[]> {
    try {
      const favorites =
        await this.favoritesAnnouncementRepository.findAllByVolunteerId(volunteerId);

      const announcements = await Promise.all(
        favorites.map(fav => this.announcementService.findById(fav.announcementId)),
      );

      return announcements
        .filter((a): a is Announcement => a != null && a.status !== 'INACTIVE')
        .map(a => ({ ...a, isFavorite: true }));
    } catch (error) {
      this.logger.error(
        'Erreur lors de la récupération des favoris du bénévole',
        error?.stack ?? error,
      );
      throw new InternalServerErrorException(
        'Erreur lors de la récupération des favoris du bénévole',
      );
    }
  }

  async findAllByAnnouncementId(announcementId: string) {
    try {
      return await this.favoritesAnnouncementRepository.findAllByAnnouncementId(announcementId);
    } catch (error) {
      this.logger.error("Erreur lors de la récupération des favoris de l'annonce", error.stack);
      throw new InternalServerErrorException(
        "Erreur lors de la récupération des favoris de l'annonce",
      );
    }
  }

  async findByVolunteerIdAndAnnouncementId(volunteerId: string, announcementId: string) {
    try {
      return await this.favoritesAnnouncementRepository.findByVolunteerIdAndAnnouncementId(
        volunteerId,
        announcementId,
      );
    } catch (error) {
      this.logger.error('Erreur lors de la recherche du favori', error.stack);
      throw new InternalServerErrorException('Erreur lors de la recherche du favori');
    }
  }

  async findByVolunteerIdAllFavoritesAnnouncement(volunteerId: string): Promise<Announcement[]> {
    try {
      const favorites =
        await this.favoritesAnnouncementRepository.findAllByVolunteerId(volunteerId);
      return await Promise.all(
        favorites.map(async favorite => {
          return await this.announcementService.findById(favorite.announcementId);
        }),
      );
    } catch (error) {
      this.logger.error(
        'Erreur lors de la récupération des annonces favorites du bénévole',
        error.stack,
      );
      throw new InternalServerErrorException(
        'Erreur lors de la récupération des annonces favorites du bénévole',
      );
    }
  }

  async removeByAssociationId(associationId: string) {
    try {
      return await this.favoritesAnnouncementRepository.removeByAssociationId(associationId);
    } catch (error) {
      this.logger.error("Erreur lors de la suppression des favoris de l'association", error.stack);
      throw new InternalServerErrorException(
        "Erreur lors de la suppression des favoris de l'association",
      );
    }
  }
}
