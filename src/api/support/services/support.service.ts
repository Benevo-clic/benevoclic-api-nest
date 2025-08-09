// src/api/support/services/support.service.ts
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { FilterReportResponse, SupportRepository } from '../repositories/support.repository';
import { CreateReportDto } from '../dto/create-report.dto';
import { UpdateReportDto } from '../dto/update-report.dto';
import { FilterReportDto } from '../dto/filter-report.dto';
import { Report } from '../entities/report.entity';
import {
  AnnouncementReportCategory,
  OtherReportCategory,
  ReportPriority,
  ReportStatus,
  ReportType,
  TechnicalReportCategory,
  UserFeedbackReportCategory,
} from '../interfaces/support.interface';
import { DiscordWebhookService } from '../../../common/services/discord/discord-webhook.service';

@Injectable()
export class SupportService {
  private readonly logger = new Logger(SupportService.name);

  constructor(
    private readonly supportRepository: SupportRepository,
    private readonly discordWebhookService: DiscordWebhookService,
  ) {}

  async createReport(createReportDto: CreateReportDto, userId?: string): Promise<Report> {
    try {
      if (createReportDto.type === ReportType.ANNOUNCEMENT && !createReportDto.announcementId) {
        throw new BadRequestException("L'ID de l'annonce est requis pour un signalement d'annonce");
      }

      if (
        createReportDto.type === ReportType.ANNOUNCEMENT &&
        !Object.values(AnnouncementReportCategory).includes(
          createReportDto.category as AnnouncementReportCategory,
        )
      ) {
        throw new BadRequestException("Catégorie invalide pour un signalement d'annonce");
      }

      if (
        createReportDto.type === ReportType.TECHNICAL &&
        !Object.values(TechnicalReportCategory).includes(
          createReportDto.category as TechnicalReportCategory,
        )
      ) {
        throw new BadRequestException('Catégorie invalide pour un signalement technique');
      }

      if (
        createReportDto.type === ReportType.USER_FEEDBACK &&
        !Object.values(UserFeedbackReportCategory).includes(
          createReportDto.category as UserFeedbackReportCategory,
        )
      ) {
        throw new BadRequestException('Catégorie invalide pour un feedback utilisateur');
      }

      if (
        createReportDto.type === ReportType.OTHER &&
        !Object.values(OtherReportCategory).includes(
          createReportDto.category as OtherReportCategory,
        )
      ) {
        throw new BadRequestException('Catégorie invalide pour un signalement autre');
      }

      const reportData = { ...createReportDto };
      if (userId) {
        (reportData as any).userId = userId;
      }
      const report = await this.supportRepository.create(reportData);

      // Envoyer une notification Discord pour le nouveau ticket
      await this.discordWebhookService.sendSupportTicketNotification(report);

      return report;
    } catch (error) {
      // Si c'est déjà une exception métier, la relancer
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error('Erreur lors de la création du signalement', error.stack);
      throw new InternalServerErrorException('Erreur lors de la création du signalement');
    }
  }

  async findAll(): Promise<Report[]> {
    try {
      return await this.supportRepository.findAll();
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error('Erreur lors de la récupération des signalements', error.stack);
      throw new InternalServerErrorException('Erreur lors de la récupération des signalements');
    }
  }

  async findById(id: string): Promise<Report> {
    try {
      const report = await this.supportRepository.findById(id);
      if (!report) {
        throw new NotFoundException(`Signalement avec l'ID ${id} non trouvé`);
      }
      return report;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Erreur lors de la récupération du signalement ${id}`, error.stack);
      throw new InternalServerErrorException('Erreur lors de la récupération du signalement');
    }
  }

  async findByUserId(userId: string): Promise<Report[]> {
    try {
      return await this.supportRepository.findByUserId(userId);
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Erreur lors de la récupération des signalements de l'utilisateur ${userId}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        'Erreur lors de la récupération des signalements utilisateur',
      );
    }
  }

  async findByAnnouncementId(announcementId: string): Promise<Report[]> {
    try {
      return await this.supportRepository.findByAnnouncementId(announcementId);
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Erreur lors de la récupération des signalements de l'annonce ${announcementId}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        "Erreur lors de la récupération des signalements d'annonce",
      );
    }
  }

  async updateReport(id: string, updateReportDto: UpdateReportDto): Promise<Report> {
    try {
      const report = await this.supportRepository.update(id, updateReportDto);
      if (!report) {
        throw new NotFoundException(`Signalement avec l'ID ${id} non trouvé`);
      }

      this.logger.log(`Signalement ${id} mis à jour avec succès`);
      return report;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Erreur lors de la mise à jour du signalement ${id}`, error.stack);
      throw new InternalServerErrorException('Erreur lors de la mise à jour du signalement');
    }
  }

  async updateStatus(id: string, status: ReportStatus): Promise<Report> {
    try {
      // Récupérer l'ancien statut avant la mise à jour
      const oldReport = await this.supportRepository.findById(id);
      if (!oldReport) {
        throw new NotFoundException(`Signalement avec l'ID ${id} non trouvé`);
      }

      const report = await this.supportRepository.update(id, { status });
      if (!report) {
        throw new NotFoundException(`Signalement avec l'ID ${id} non trouvé`);
      }

      await this.discordWebhookService.sendStatusUpdateNotification(
        {
          ...report,
          id,
        },
        oldReport.status,
        status,
      );

      this.logger.log(`Statut du signalement ${id} mis à jour: ${status}`);
      return report;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Erreur lors de la mise à jour du statut du signalement ${id}`,
        error.stack,
      );
      throw new InternalServerErrorException('Erreur lors de la mise à jour du statut');
    }
  }

  async updatePriority(id: string, priority: ReportPriority): Promise<Report> {
    try {
      const report = await this.supportRepository.update(id, { priority });
      if (!report) {
        throw new NotFoundException(`Signalement avec l'ID ${id} non trouvé`);
      }

      this.logger.log(`Priorité du signalement ${id} mise à jour: ${priority}`);
      return report;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Erreur lors de la mise à jour de la priorité du signalement ${id}`,
        error.stack,
      );
      throw new InternalServerErrorException('Erreur lors de la mise à jour de la priorité');
    }
  }

  async deleteReport(id: string): Promise<void> {
    try {
      const report = await this.supportRepository.findById(id);
      if (!report) {
        throw new NotFoundException(`Signalement avec l'ID ${id} non trouvé`);
      }

      await this.supportRepository.delete(id);
      this.logger.log(`Signalement ${id} supprimé avec succès`);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Erreur lors de la suppression du signalement ${id}`, error.stack);
      throw new InternalServerErrorException('Erreur lors de la suppression du signalement');
    }
  }

  async filterReports(filterDto: FilterReportDto): Promise<FilterReportResponse> {
    try {
      return await this.supportRepository.filterReports(filterDto);
    } catch (error) {
      this.logger.error('Erreur lors du filtrage des signalements', error.stack);
      throw new InternalServerErrorException('Erreur lors du filtrage des signalements');
    }
  }

  async getStats(): Promise<any> {
    try {
      return await this.supportRepository.getStats();
    } catch (error) {
      this.logger.error('Erreur lors de la récupération des statistiques', error.stack);
      throw new InternalServerErrorException('Erreur lors de la récupération des statistiques');
    }
  }
}
