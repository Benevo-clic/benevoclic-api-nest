import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { SettingsRepository } from '../repository/settings.repository';
import { UpdateVolunteerSettingsDto } from '../dto/update-volunteer-settings.dto';
import { UpdateAssociationSettingsDto } from '../dto/update-association-settings.dto';
import { VolunteerSettings } from '../entities/volunteer-settings.entity';
import { AssociationSettings } from '../entities/association-settings.entity';

@Injectable()
export class SettingsService {
  private readonly logger = new Logger(SettingsService.name);

  constructor(private readonly repo: SettingsRepository) {}

  async getOrCreateVolunteerSettings(userId: string): Promise<VolunteerSettings> {
    try {
      let settings = await this.repo.findVolunteerSettingsByUserId(userId);
      if (!settings) {
        settings = await this.repo.createVolunteerSettings({
          userId,
          profileVisibility: true,
          locationSharing: false,
          activitySharing: true,
          twoFactor: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        this.logger.log(`Settings volunteer créés pour ${userId}`);
      }
      return settings;
    } catch (error) {
      this.logger.error(`Erreur getOrCreate volunteer (${userId})`, error?.stack || String(error));
      throw new InternalServerErrorException('Erreur lors de la récupération des paramètres');
    }
  }

  async getVolunteerSettings(userId: string): Promise<VolunteerSettings> {
    try {
      const settings = await this.repo.findVolunteerSettingsByUserId(userId);
      if (!settings) {
        throw new InternalServerErrorException('Paramètres du volontaire non trouvés');
      }
      return settings;
    } catch (error) {
      this.logger.error(`Erreur get volunteer (${userId})`, error?.stack || String(error));
      throw new InternalServerErrorException('Erreur lors de la récupération des paramètres');
    }
  }

  async getAssociationSettings(associationId: string): Promise<AssociationSettings> {
    try {
      const settings = await this.repo.findAssociationSettingsByAssociationId(associationId);
      if (!settings) {
        throw new InternalServerErrorException('Paramètres de l’association non trouvés');
      }
      return settings;
    } catch (error) {
      this.logger.error(`Erreur get association (${associationId})`, error?.stack || String(error));
      throw new InternalServerErrorException('Erreur lors de la récupération des paramètres');
    }
  }

  async updateVolunteerSettings(
    userId: string,
    dto: UpdateVolunteerSettingsDto,
  ): Promise<VolunteerSettings> {
    try {
      const settings = await this.repo.upsertVolunteerSettings(userId, dto);
      this.logger.log(`Settings volunteer mis à jour pour ${userId}`);
      return settings;
    } catch (error) {
      this.logger.error(`Erreur update volunteer (${userId})`, error?.stack || String(error));
      throw new InternalServerErrorException('Erreur lors de la mise à jour des paramètres');
    }
  }

  async deleteVolunteerSettings(userId: string): Promise<void> {
    try {
      const result = await this.repo.deleteVolunteerSettings(userId);
      if (result.deletedCount === 0) {
        throw new InternalServerErrorException('Paramètres du volontaire non trouvés');
      }
      this.logger.log(`Settings volunteer supprimés pour ${userId}`);
    } catch (error) {
      this.logger.error(`Erreur delete volunteer (${userId})`, error?.stack || String(error));
      throw new InternalServerErrorException('Erreur lors de la suppression des paramètres');
    }
  }

  // -------- Association --------
  async getOrCreateAssociationSettings(associationId: string): Promise<AssociationSettings> {
    try {
      let settings = await this.repo.findAssociationSettingsByAssociationId(associationId);
      if (!settings) {
        settings = await this.repo.createAssociationSettings({
          associationId,
          profileVisibility: true,
          contactInfoVisibility: false,
          eventVisibility: true,
          volunteerListVisibility: false,
          twoFactor: false,
          loginNotifications: true,
          siretVerification: true,
          autoApproveVolunteers: false,
          volunteerLimits: true,
          participantLimits: true,
          eventApproval: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        this.logger.log(`Settings association créés pour ${associationId}`);
      }
      return settings;
    } catch (error) {
      this.logger.error(
        `Erreur getOrCreate association (${associationId})`,
        error?.stack || String(error),
      );
      throw new InternalServerErrorException('Erreur lors de la récupération des paramètres');
    }
  }

  async updateAssociationSettings(
    associationId: string,
    dto: UpdateAssociationSettingsDto,
  ): Promise<AssociationSettings> {
    try {
      const settings = await this.repo.upsertAssociationSettings(associationId, dto);
      this.logger.log(`Settings association mis à jour pour ${associationId}`);
      return settings;
    } catch (error) {
      this.logger.error(
        `Erreur update association (${associationId})`,
        error?.stack || String(error),
      );
      throw new InternalServerErrorException('Erreur lors de la mise à jour des paramètres');
    }
  }

  async deleteAssociationSettings(associationId: string): Promise<void> {
    try {
      const result = await this.repo.deleteAssociationSettings(associationId);
      if (result.deletedCount === 0) {
        throw new InternalServerErrorException('Paramètres de l’association non trouvés');
      }
      this.logger.log(`Settings association supprimés pour ${associationId}`);
    } catch (error) {
      this.logger.error(
        `Erreur delete association (${associationId})`,
        error?.stack || String(error),
      );
      throw new InternalServerErrorException('Erreur lors de la suppression des paramètres');
    }
  }
}
