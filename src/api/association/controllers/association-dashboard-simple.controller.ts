import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../../../guards/auth.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../../common/enums/roles.enum';
import { AssociationStatsSimpleService } from '../services/association-stats-simple.service';
import { AssociationStatsFilterDto } from '../dto/association-stats.dto';
import { AssociationDashboardResponseDto } from '../dto/association-dashboard.dto';
import { AnnouncementService } from '../../announcement/services/announcement.service';

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
    this.logger.log(`Récupération du dashboard pour l'association: ${associationId}`);

    // Récupérer toutes les annonces de l'association
    const announcements = await this.announcementService.findByAssociationId(associationId);

    // Calculer les statistiques
    return await this.associationStatsService.getAssociationDashboard(
      associationId,
      filter,
      announcements,
    );
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
