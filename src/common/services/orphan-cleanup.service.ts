import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { FavoritesAnnouncementService } from '../../api/favorites-announcement/services/favorites-announcement.service';
import { AnnouncementService } from '../../api/announcement/services/announcement.service';

@Injectable()
export class OrphanCleanupService {
  private readonly logger = new Logger(OrphanCleanupService.name);

  constructor(
    private readonly favoritesAnnouncementService: FavoritesAnnouncementService,
    private readonly announcementService: AnnouncementService,
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
          // Vérifier si l'annonce existe encore
          await this.announcementService.findById(favorite.announcementId);
        } catch (error) {
          // L'annonce n'existe plus, supprimer le favori
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
}
