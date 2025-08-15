import {
  Controller,
  Get,
  Query,
  UseGuards,
  Logger,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from '../../../guards/auth.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../../common/enums/roles.enum';
import { AssociationStatsSimpleService } from '../services/association-stats-simple.service';
import { AssociationStatsFilterDto } from '../dto/association-stats.dto';
import { AssociationDashboardResponseDto } from '../dto/association-dashboard.dto';
import { AnnouncementService } from '../../announcement/services/announcement.service';
import { Public } from 'src/common/decorators/public.decorator';

@ApiTags('association-dashboard')
@Controller('association-dashboard')
export class AssociationDashboardSimpleController {
  private readonly logger = new Logger(AssociationDashboardSimpleController.name);

  constructor(
    private readonly associationStatsService: AssociationStatsSimpleService,
    private readonly announcementService: AnnouncementService,
  ) {}

  @Get(':associationId')
  @UseGuards(AuthGuard)
  @Roles(UserRole.ASSOCIATION, UserRole.ADMIN)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Récupérer le dashboard complet d'une association",
    description:
      "Retourne toutes les statistiques et métriques pour le dashboard d'une association",
  })
  @ApiResponse({
    status: 200,
    description: 'Dashboard récupéré avec succès',
    type: AssociationDashboardResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Non autorisé' })
  @ApiResponse({ status: 403, description: 'Accès interdit' })
  @ApiResponse({ status: 404, description: 'Association non trouvée' })
  @ApiQuery({
    name: 'startDate',
    required: false,
    description: 'Date de début pour le filtrage (format ISO)',
    example: '2024-01-01',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    description: 'Date de fin pour le filtrage (format ISO)',
    example: '2024-12-31',
  })
  @ApiQuery({
    name: 'eventType',
    required: false,
    description: "Type d'événement à filtrer",
    example: 'collecte',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Statut des annonces à inclure',
    example: 'active',
  })
  async getAssociationDashboard(
    @Param('associationId') associationId: string,
    @Query() filter: AssociationStatsFilterDto,
  ): Promise<AssociationDashboardResponseDto> {
    this.logger.log(`=== DASHBOARD BACKEND DEBUG ===`);
    this.logger.log(`Association ID reçu: ${associationId}`);
    this.logger.log(`Filtres reçus:`, JSON.stringify(filter, null, 2));

    // Récupérer toutes les annonces de l'association
    this.logger.log(`Appel de findByAssociationId pour: ${associationId}`);
    const announcements = await this.announcementService.findByAssociationId(associationId);

    this.logger.log(`Nombre d'annonces trouvées: ${announcements.length}`);

    if (announcements.length > 0) {
      this.logger.log(`Première annonce:`, {
        id: announcements[0].id,
        nameEvent: announcements[0].nameEvent,
        status: announcements[0].status,
        associationId: announcements[0].associationId,
        participants: announcements[0].participants?.length || 0,
        volunteers: announcements[0].volunteers?.length || 0,
      });

      if (announcements.length > 1) {
        this.logger.log(`Deuxième annonce:`, {
          id: announcements[1].id,
          nameEvent: announcements[1].nameEvent,
          status: announcements[1].status,
          associationId: announcements[1].associationId,
        });
      }
    } else {
      this.logger.warn(`AUCUNE ANNONCE TROUVÉE pour l'association: ${associationId}`);
    }

    this.logger.log(`Appel du service de statistiques...`);
    const result = await this.associationStatsService.getAssociationDashboard(
      associationId,
      filter,
      announcements,
    );

    this.logger.log(`Résultat des statistiques:`, {
      totalAnnouncements: result.announcementStats.totalAnnouncements,
      totalParticipants: result.participantStats.totalUniqueParticipants,
      totalVolunteers: result.volunteerStats.totalUniqueVolunteers,
      engagementRate: result.engagementStats.overallEngagementRate,
    });

    this.logger.log(`=== FIN DASHBOARD BACKEND DEBUG ===`);
    return result;
  }

  @Get(':associationId/announcements')
  @UseGuards(AuthGuard)
  @Roles(UserRole.ASSOCIATION, UserRole.ADMIN)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Récupérer les statistiques des annonces d'une association",
    description: "Retourne les métriques détaillées sur les annonces de l'association",
  })
  @ApiResponse({
    status: 200,
    description: 'Statistiques des annonces récupérées avec succès',
  })
  async getAnnouncementStats(
    @Param('associationId') associationId: string,
    @Query() filter: AssociationStatsFilterDto,
  ) {
    this.logger.log(
      `Récupération des statistiques d'annonces pour l'association: ${associationId}`,
    );
    const announcements = await this.announcementService.findByAssociationId(associationId);
    const dashboard = await this.associationStatsService.getAssociationDashboard(
      associationId,
      filter,
      announcements,
    );
    return dashboard.announcementStats;
  }

  @Get(':associationId/participants')
  @UseGuards(AuthGuard)
  @Roles(UserRole.ASSOCIATION, UserRole.ADMIN)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Récupérer les statistiques des participants d'une association",
    description: "Retourne les métriques détaillées sur les participants de l'association",
  })
  @ApiResponse({
    status: 200,
    description: 'Statistiques des participants récupérées avec succès',
  })
  async getParticipantStats(
    @Param('associationId') associationId: string,
    @Query() filter: AssociationStatsFilterDto,
  ) {
    this.logger.log(
      `Récupération des statistiques de participants pour l'association: ${associationId}`,
    );
    const announcements = await this.announcementService.findByAssociationId(associationId);
    const dashboard = await this.associationStatsService.getAssociationDashboard(
      associationId,
      filter,
      announcements,
    );
    return dashboard.participantStats;
  }

  @Get(':associationId/volunteers')
  @UseGuards(AuthGuard)
  @Roles(UserRole.ASSOCIATION, UserRole.ADMIN)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Récupérer les statistiques des bénévoles d'une association",
    description: "Retourne les métriques détaillées sur les bénévoles de l'association",
  })
  @ApiResponse({
    status: 200,
    description: 'Statistiques des bénévoles récupérées avec succès',
  })
  async getVolunteerStats(
    @Param('associationId') associationId: string,
    @Query() filter: AssociationStatsFilterDto,
  ) {
    this.logger.log(
      `Récupération des statistiques de bénévoles pour l'association: ${associationId}`,
    );
    const announcements = await this.announcementService.findByAssociationId(associationId);
    const dashboard = await this.associationStatsService.getAssociationDashboard(
      associationId,
      filter,
      announcements,
    );
    return dashboard.volunteerStats;
  }

  @Get(':associationId/engagement')
  @UseGuards(AuthGuard)
  @Roles(UserRole.ASSOCIATION, UserRole.ADMIN)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Récupérer les statistiques d'engagement d'une association",
    description: "Retourne les métriques d'engagement et de performance de l'association",
  })
  @ApiResponse({
    status: 200,
    description: "Statistiques d'engagement récupérées avec succès",
  })
  async getEngagementStats(
    @Param('associationId') associationId: string,
    @Query() filter: AssociationStatsFilterDto,
  ) {
    this.logger.log(
      `Récupération des statistiques d'engagement pour l'association: ${associationId}`,
    );
    const announcements = await this.announcementService.findByAssociationId(associationId);
    const dashboard = await this.associationStatsService.getAssociationDashboard(
      associationId,
      filter,
      announcements,
    );
    return dashboard.engagementStats;
  }

  @Get(':associationId/timeline')
  @UseGuards(AuthGuard)
  @Roles(UserRole.ASSOCIATION, UserRole.ADMIN)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Récupérer les données temporelles d'une association",
    description: 'Retourne les données chronologiques pour les graphiques temporels',
  })
  @ApiResponse({
    status: 200,
    description: 'Données temporelles récupérées avec succès',
  })
  async getTimeSeriesData(
    @Param('associationId') associationId: string,
    @Query() filter: AssociationStatsFilterDto,
  ) {
    this.logger.log(`Récupération des données temporelles pour l'association: ${associationId}`);
    const announcements = await this.announcementService.findByAssociationId(associationId);
    const dashboard = await this.associationStatsService.getAssociationDashboard(
      associationId,
      filter,
      announcements,
    );
    return dashboard.timeSeriesData;
  }

  @Get(':associationId/event-types')
  @UseGuards(AuthGuard)
  @Roles(UserRole.ASSOCIATION, UserRole.ADMIN)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Récupérer les statistiques par type d'événement d'une association",
    description: "Retourne les métriques détaillées par type d'événement",
  })
  @ApiResponse({
    status: 200,
    description: "Statistiques par type d'événement récupérées avec succès",
  })
  async getEventTypeStats(
    @Param('associationId') associationId: string,
    @Query() filter: AssociationStatsFilterDto,
  ) {
    this.logger.log(
      `Récupération des statistiques par type d'événement pour l'association: ${associationId}`,
    );
    const announcements = await this.announcementService.findByAssociationId(associationId);
    const dashboard = await this.associationStatsService.getAssociationDashboard(
      associationId,
      filter,
      announcements,
    );
    return dashboard.eventTypeStats;
  }
}
