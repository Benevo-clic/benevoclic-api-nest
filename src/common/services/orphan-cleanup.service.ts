import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { FavoritesAnnouncementService } from '../../api/favorites-announcement/services/favorites-announcement.service';
import { AnnouncementService } from '../../api/announcement/services/announcement.service';
import { VolunteerRepository } from '../../api/volunteer/repository/volunteer.repository';

@Injectable()
export class OrphanCleanupService {
  private readonly logger = new Logger(OrphanCleanupService.name);

  constructor(
    private readonly favoritesAnnouncementService: FavoritesAnnouncementService,
    private readonly announcementService: AnnouncementService,
    private readonly volunteerRepository: VolunteerRepository,
  ) {}

  /**
   * Nettoie les favoris orphelins (favoris sans annonce correspondante)
   * Exécuté automatiquement tous les jours à 2h du matin
   */
  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async cleanupOrphanFavorites() {
    this.logger.log('Début du nettoyage des favoris orphelins...');

    try {
      const allFavorites = await this.favoritesAnnouncementService.findAll();
      let orphanCount = 0;

      for (const favorite of allFavorites) {
        try {
          await this.announcementService.findById(favorite.announcementId);
        } catch (error) {
          await this.favoritesAnnouncementService.removeByVolunteerIdAndAnnouncementId(
            favorite.volunteerId,
            favorite.announcementId,
          );
          orphanCount++;
          this.logger.log(
            `Favori orphelin supprimé: ${favorite.announcementId} pour ${favorite.volunteerId}`,
          );
        }
      }

      this.logger.log(`Nettoyage terminé: ${orphanCount} favoris orphelins supprimés`);
    } catch (error) {
      this.logger.error('Erreur lors du nettoyage des favoris orphelins', error.stack);
    }
  }

  /**
   * Nettoie manuellement les favoris orphelins
   */
  async manualCleanup(): Promise<{ deletedCount: number; errors: string[] }> {
    this.logger.log('Nettoyage manuel des favoris orphelins...');

    const result = {
      deletedCount: 0,
      errors: [] as string[],
    };

    try {
      const allFavorites = await this.favoritesAnnouncementService.findAll();

      for (const favorite of allFavorites) {
        try {
          await this.announcementService.findById(favorite.announcementId);
        } catch (error) {
          try {
            await this.favoritesAnnouncementService.removeByVolunteerIdAndAnnouncementId(
              favorite.volunteerId,
              favorite.announcementId,
            );
            result.deletedCount++;
          } catch (deleteError) {
            result.errors.push(
              `Erreur suppression favori ${favorite.announcementId}: ${deleteError.message}`,
            );
          }
        }
      }

      this.logger.log(`Nettoyage manuel terminé: ${result.deletedCount} favoris supprimés`);
    } catch (error) {
      result.errors.push(`Erreur générale: ${error.message}`);
      this.logger.error('Erreur lors du nettoyage manuel', error.stack);
    }

    return result;
  }

  async cleanupVolunteer(volunteerId: string) {
    await this.favoritesAnnouncementService.removeByVolunteerId(volunteerId);
    await this.announcementService.removeVolunteerEverywhere(volunteerId);
  }

  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async cleanupOrphanVolunteers() {
    const allVolunteers = await this.volunteerRepository.findAll();
    const existingVolunteerIds = new Set(allVolunteers.map(v => v.volunteerId));

    const allFavorites = await this.favoritesAnnouncementService.findAll();
    const favoriteVolunteerIds = new Set(allFavorites.map(fav => fav.volunteerId));

    const allAnnouncements = await this.announcementService.findAll();
    const announcementVolunteerIds = new Set();
    for (const ann of allAnnouncements) {
      if (Array.isArray(ann.volunteers)) {
        ann.volunteers.forEach(v => announcementVolunteerIds.add(v.id));
      }
      if (Array.isArray(ann.volunteersWaiting)) {
        ann.volunteersWaiting.forEach(v => announcementVolunteerIds.add(v.id));
      }
    }

    const orphanVolunteerIds = new Set(
      [...favoriteVolunteerIds, ...announcementVolunteerIds].filter(
        id => !existingVolunteerIds.has(id as string),
      ),
    );

    let favoritesDeleted = 0;
    let announcementsUpdated = 0;
    for (const orphanId of orphanVolunteerIds) {
      const favResult = await this.favoritesAnnouncementService.removeByVolunteerId(
        orphanId as string,
      );
      if (favResult && favResult.deletedCount) favoritesDeleted += favResult.deletedCount;
      const annResult = await this.announcementService.removeVolunteerEverywhere(
        orphanId as string,
      );
      if (annResult) announcementsUpdated += annResult;
    }
    return {
      orphanVolunteerIds: Array.from(orphanVolunteerIds),
      favoritesDeleted,
      announcementsUpdated,
    };
  }
}
