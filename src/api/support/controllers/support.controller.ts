// src/api/support/controllers/support.controller.ts
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { SupportService } from '../services/support.service';
import { Public } from '../../../common/decorators/public.decorator';
import { AuthGuard } from '../../../guards/auth.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../../common/enums/roles.enum';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Report } from '../entities/report.entity';
import { CreateReportDto } from '../dto/create-report.dto';
import { UpdateReportDto } from '../dto/update-report.dto';
import { FilterReportResponse } from '../repositories/support.repository';
import { ReportPriority, ReportStatus } from '../interfaces/support.interface';
import { FilterReportDto } from '../dto/filter-report.dto';

@UsePipes(
  new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }),
)
@ApiTags('support')
@Controller('support')
export class SupportController {
  private readonly logger = new Logger(SupportController.name);

  constructor(private readonly supportService: SupportService) {}

  @Public()
  @Post('reports')
  @ApiOperation({ summary: 'Créer un nouveau signalement' })
  @ApiResponse({
    status: 201,
    description: 'Signalement créé avec succès',
    type: Report,
  })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  @ApiResponse({ status: 500, description: 'Erreur interne du serveur' })
  async createReport(
    @Body() createReportDto: CreateReportDto,
    @Request() req: any,
  ): Promise<Report> {
    try {
      const userId = req.user?.userId;
      return await this.supportService.createReport(createReportDto, userId);
    } catch (error) {
      this.logger.error('Erreur lors de la création du signalement', error.stack);
      throw error;
    }
  }

  @Get('reports')
  @UseGuards(AuthGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Récupérer tous les signalements (Admin)' })
  @ApiResponse({
    status: 200,
    description: 'Liste des signalements récupérée avec succès',
    type: [Report],
  })
  async findAll(): Promise<Report[]> {
    try {
      return await this.supportService.findAll();
    } catch (error) {
      this.logger.error('Erreur lors de la récupération des signalements', error.stack);
      throw error;
    }
  }

  @Get('reports/my')
  @UseGuards(AuthGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Récupérer mes signalements' })
  @ApiResponse({
    status: 200,
    description: 'Mes signalements récupérés avec succès',
    type: [Report],
  })
  async getMyReports(@Request() req: any): Promise<Report[]> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new Error('Utilisateur non authentifié');
      }
      return await this.supportService.findByUserId(userId);
    } catch (error) {
      this.logger.error('Erreur lors de la récupération de mes signalements', error.stack);
      throw error;
    }
  }

  @Get('reports/:id')
  @UseGuards(AuthGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Récupérer un signalement par ID' })
  @ApiParam({ name: 'id', description: 'ID du signalement' })
  @ApiResponse({
    status: 200,
    description: 'Signalement trouvé',
    type: Report,
  })
  @ApiResponse({ status: 404, description: 'Signalement non trouvé' })
  async findById(@Param('id') id: string): Promise<Report> {
    try {
      return await this.supportService.findById(id);
    } catch (error) {
      this.logger.error(`Erreur lors de la récupération du signalement ${id}`, error.stack);
      throw error;
    }
  }

  @Get('reports/announcement/:announcementId')
  @UseGuards(AuthGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Récupérer les signalements d'une annonce" })
  @ApiParam({ name: 'announcementId', description: "ID de l'annonce" })
  @ApiResponse({
    status: 200,
    description: "Signalements de l'annonce récupérés avec succès",
    type: [Report],
  })
  async findByAnnouncementId(@Param('announcementId') announcementId: string): Promise<Report[]> {
    try {
      return await this.supportService.findByAnnouncementId(announcementId);
    } catch (error) {
      this.logger.error(
        `Erreur lors de la récupération des signalements de l'annonce ${announcementId}`,
        error.stack,
      );
      throw error;
    }
  }

  @Patch('reports/:id')
  @UseGuards(AuthGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mettre à jour un signalement (Admin)' })
  @ApiParam({ name: 'id', description: 'ID du signalement' })
  @ApiResponse({
    status: 200,
    description: 'Signalement mis à jour avec succès',
    type: Report,
  })
  @ApiResponse({ status: 404, description: 'Signalement non trouvé' })
  async updateReport(
    @Param('id') id: string,
    @Body() updateReportDto: UpdateReportDto,
  ): Promise<Report> {
    try {
      return await this.supportService.updateReport(id, updateReportDto);
    } catch (error) {
      this.logger.error(`Erreur lors de la mise à jour du signalement ${id}`, error.stack);
      throw error;
    }
  }

  @Patch('reports/:id/status')
  @UseGuards(AuthGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Mettre à jour le statut d'un signalement (Admin)" })
  @ApiParam({ name: 'id', description: 'ID du signalement' })
  @ApiResponse({
    status: 200,
    description: 'Statut mis à jour avec succès',
    type: Report,
  })
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: ReportStatus,
  ): Promise<Report> {
    try {
      // Validation du statut
      if (!Object.values(ReportStatus).includes(status)) {
        throw new BadRequestException('Statut invalide');
      }
      return await this.supportService.updateStatus(id, status);
    } catch (error) {
      this.logger.error(
        `Erreur lors de la mise à jour du statut du signalement ${id}`,
        error.stack,
      );
      throw error;
    }
  }

  @Patch('reports/:id/priority')
  @UseGuards(AuthGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Mettre à jour la priorité d'un signalement (Admin)" })
  @ApiParam({ name: 'id', description: 'ID du signalement' })
  @ApiResponse({
    status: 200,
    description: 'Priorité mise à jour avec succès',
    type: Report,
  })
  async updatePriority(
    @Param('id') id: string,
    @Body('priority') priority: ReportPriority,
  ): Promise<Report> {
    try {
      // Validation de la priorité
      if (!Object.values(ReportPriority).includes(priority)) {
        throw new BadRequestException('Priorité invalide');
      }
      return await this.supportService.updatePriority(id, priority);
    } catch (error) {
      this.logger.error(
        `Erreur lors de la mise à jour de la priorité du signalement ${id}`,
        error.stack,
      );
      throw error;
    }
  }

  @Delete('reports/:id')
  @UseGuards(AuthGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Supprimer un signalement (Admin)' })
  @ApiParam({ name: 'id', description: 'ID du signalement' })
  @ApiResponse({ status: 200, description: 'Signalement supprimé avec succès' })
  @ApiResponse({ status: 404, description: 'Signalement non trouvé' })
  async deleteReport(@Param('id') id: string): Promise<void> {
    try {
      await this.supportService.deleteReport(id);
    } catch (error) {
      this.logger.error(`Erreur lors de la suppression du signalement ${id}`, error.stack);
      throw error;
    }
  }

  @Get('reports/filter')
  @UseGuards(AuthGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Filtrer les signalements (Admin)' })
  @ApiQuery({ name: 'type', required: false, enum: ['ANNOUNCEMENT', 'TECHNICAL'] })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['PENDING', 'IN_PROGRESS', 'RESOLVED', 'REJECTED'],
  })
  @ApiQuery({ name: 'priority', required: false, enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] })
  @ApiResponse({
    status: 200,
    description: 'Signalements filtrés récupérés avec succès',
    schema: {
      type: 'object',
      properties: {
        reports: {
          type: 'array',
          items: { $ref: '#/components/schemas/Report' },
        },
        meta: {
          type: 'object',
          properties: {
            page: { type: 'number' },
            limit: { type: 'number' },
            total: { type: 'number' },
            pages: { type: 'number' },
          },
        },
      },
    },
  })
  async filterReports(@Query() filterDto: FilterReportDto): Promise<FilterReportResponse> {
    try {
      return await this.supportService.filterReports(filterDto);
    } catch (error) {
      this.logger.error('Erreur lors du filtrage des signalements', error.stack);
      throw error;
    }
  }

  @Get('stats')
  @UseGuards(AuthGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Récupérer les statistiques des signalements (Admin)' })
  @ApiResponse({
    status: 200,
    description: 'Statistiques récupérées avec succès',
  })
  async getStats(): Promise<any> {
    try {
      return await this.supportService.getStats();
    } catch (error) {
      this.logger.error('Erreur lors de la récupération des statistiques', error.stack);
      throw error;
    }
  }
}
