import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AnnouncementService } from '../services/announcement.service';
import { Public } from '../../../common/decorators/public.decorator';
import { AuthGuard } from '../../../guards/auth.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../../common/enums/roles.enum';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Announcement } from '../entities/announcement.entity';
import { CreateAnnouncementDto } from '../dto/create-announcement.dto';
import { UpdateAnnouncementDto } from '../dto/update-announcement.dto';
import { InfoVolunteer } from '../../association/type/association.type';
import { InfoVolunteerDto } from '../../association/dto/info-volunteer.dto';
import { AnnouncementStatus } from '../interfaces/announcement.interface';
import { FileInterceptor } from '@nestjs/platform-express';
import { fileSchema } from '../../../common/utils/file-utils';
import { FilterAnnouncementDto } from '../dto/filter-announcement.dto';
import { FilterAnnouncementResponse } from '../repositories/announcement.repository';
import { FilterAssociationAnnouncementDto } from '../dto/filter-association-announcement.dto';
import { UpdateVisibilityAnnouncementAssociationDTO } from '../dto/update-visibility-annoncement-association.dto';

@UsePipes(
  new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }),
)
@ApiTags('announcements')
@Controller('announcements')
export class AnnouncementController {
  private readonly logger = new Logger('AnnouncementController');

  constructor(private readonly service: AnnouncementService) {}

  @Public()
  @Get('allAnnouncements')
  @ApiOperation({ summary: 'Récupérer toutes les annonces' })
  @ApiResponse({
    status: 200,
    description: 'Liste des annonces récupérée avec succès',
    type: [Announcement],
  })
  @ApiBody({
    description: 'Aucune donnée requise pour cette opération',
    type: [Announcement],
  })
  @ApiResponse({ status: 500, description: 'Erreur interne du serveur' })
  async findAll(): Promise<Announcement[]> {
    try {
      return await this.service.findAll();
    } catch (error) {
      this.logger.error('Erreur lors de la récupération des annonces', error.stack);
      throw error;
    }
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Récupérer une annonce par son ID' })
  @ApiParam({ name: 'id', description: "ID de l'annonce" })
  @ApiResponse({
    status: 200,
    description: 'Annonce trouvée',
    type: Announcement,
  })
  @ApiBody({
    description: 'Aucune donnée requise pour cette opération',
    type: Announcement,
  })
  @ApiResponse({ status: 404, description: 'Annonce non trouvée' })
  @ApiResponse({ status: 500, description: 'Erreur interne du serveur' })
  async findById(@Param('id') id: string): Promise<Announcement> {
    this.logger.log(`Récupération de l'annonce avec l'ID: ${id}`);
    try {
      return await this.service.findById(id);
    } catch (error) {
      this.logger.error(`Erreur lors de la récupération de l'annonce: ${id}`, error.stack);
      throw error;
    }
  }

  @Post('createAnnouncement')
  @UseGuards(AuthGuard)
  @Roles(UserRole.ASSOCIATION, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new announcement' })
  @ApiBody({ type: CreateAnnouncementDto })
  @ApiResponse({
    status: 201,
    description: 'Annonce créée avec succès',
    type: String,
  })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  async create(@Body() announcement: CreateAnnouncementDto): Promise<string> {
    try {
      return await this.service.create(announcement);
    } catch (error) {
      this.logger.error("Erreur lors de la création de l'annonce", error.stack);
      throw error;
    }
  }

  @Public()
  @Post('filter/announcements')
  async filterAnnouncementsAggregation(
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    filterDto: FilterAnnouncementDto,
  ): Promise<FilterAnnouncementResponse> {
    try {
      return await this.service.filterAnnouncementsAggregation(filterDto);
    } catch (error) {
      this.logger.error('Erreur lors de la récupération des annonces filtrées', error.stack);
      return {
        annonces: [],
        meta: {
          total: 0,
          page: 1,
          limit: 10,
        },
      } as FilterAnnouncementResponse;
    }
  }

  @Post('filter/association')
  @UseGuards(AuthGuard)
  @Roles(UserRole.ASSOCIATION, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Filter announcements by association' })
  @ApiBody({ type: FilterAssociationAnnouncementDto })
  async filterAnnouncementsByAssociation(
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    filterDto: FilterAssociationAnnouncementDto,
  ): Promise<FilterAnnouncementResponse> {
    try {
      return await this.service.filterAssociationAnnouncements(filterDto);
    } catch (error) {
      this.logger.error(
        'Erreur lors de la récupération des annonces filtrées par association',
        error.stack,
      );
      throw error;
    }
  }

  @Get('association/:associationId')
  @UseGuards(AuthGuard)
  @Roles(UserRole.ASSOCIATION, UserRole.VOLUNTEER, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Find all announcements by association ID' })
  @ApiParam({
    name: 'associationId',
    required: true,
    description: "ID de l'association",
  })
  @ApiResponse({
    status: 200,
    description: 'Liste des annonces de l’association récupérée avec succès',
    type: [Announcement],
  })
  async findByAssociationId(
    @Param('associationId') associationId: string,
  ): Promise<Announcement[]> {
    try {
      return await this.service.findByAssociationId(associationId);
    } catch (error) {
      this.logger.error(
        `Erreur lors de la récupération des annonces de l'association: ${associationId}`,
        error.stack,
      );
      throw error;
    }
  }

  @Get('volunteer/:volunteerId')
  @UseGuards(AuthGuard)
  @Roles(UserRole.VOLUNTEER, UserRole.ADMIN, UserRole.ASSOCIATION)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Find volunteer in volunteers by volunteer ID' })
  @ApiParam({
    name: 'volunteerId',
    required: true,
    description: 'ID du bénévole',
  })
  @ApiResponse({
    status: 200,
    description: 'Liste des annonces du bénévole récupérée avec succès',
    type: [Announcement],
  })
  async findVolunteerInVolunteersByVolunteerId(
    @Param('volunteerId') volunteerId: string,
  ): Promise<Announcement[]> {
    try {
      return await this.service.findVolunteerInAnnouncementByVolunteerId(volunteerId);
    } catch (error) {
      this.logger.error(
        `Erreur lors de la recherche du bénévole dans les volontaires: ${volunteerId}`,
        error.stack,
      );
      throw error;
    }
  }

  @Get('participant/past/:volunteerId')
  @UseGuards(AuthGuard)
  @Roles(UserRole.VOLUNTEER, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Find past announcements by participant ID' })
  @ApiParam({
    name: 'volunteerId',
    required: true,
    description: 'ID du participant',
  })
  @ApiResponse({
    status: 200,
    description: 'Liste des annonces passées du participant récupérée avec succès',
    type: [Announcement],
  })
  async findPastAnnouncementsByParticipantId(
    @Param('volunteerId') volunteerId: string,
  ): Promise<Announcement[]> {
    try {
      return await this.service.findPastAnnouncementsByParticipantId(volunteerId);
    } catch (error) {
      this.logger.error(
        `Erreur lors de la recherche des annonces passées du participant: ${volunteerId}`,
        error.stack,
      );
      throw error;
    }
  }

  @Get('participant/:volunteerId')
  @UseGuards(AuthGuard)
  @Roles(UserRole.VOLUNTEER, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Find participant in participants by volunteer ID' })
  @ApiParam({
    name: 'volunteerId',
    required: true,
    description: 'ID du participant',
  })
  @ApiResponse({
    status: 200,
    description: 'Liste des annonces du participant récupérée avec succès',
    type: [Announcement],
  })
  async findParticipantInParticipantsByParticipantId(
    @Param('volunteerId') volunteerId: string,
  ): Promise<Announcement[]> {
    try {
      return await this.service.findParticipantInParticipantsByParticipantId(volunteerId);
    } catch (error) {
      this.logger.error(
        `Erreur lors de la recherche du bénévole dans les volontaires: ${volunteerId}`,
        error.stack,
      );
      throw error;
    }
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  @Roles(UserRole.ASSOCIATION, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update an announcement' })
  @ApiParam({
    name: 'id',
    required: true,
    description: "ID de l'annonce à mettre à jour",
  })
  @ApiBody({ type: CreateAnnouncementDto })
  @ApiResponse({
    status: 200,
    description: 'Annonce mise à jour avec succès',
    type: Announcement,
  })
  async update(
    @Param('id') id: string,
    @Body() announcement: UpdateAnnouncementDto,
  ): Promise<Partial<Announcement>> {
    try {
      return await this.service.update(id, announcement);
    } catch (error) {
      this.logger.error(`Erreur lors de la mise à jour de l'annonce: ${id}`, error.stack);
      throw error;
    }
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @Roles(UserRole.ASSOCIATION, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Supprimer une annonce par son ID' })
  @ApiParam({
    name: 'id',
    required: true,
    description: "ID de l'annonce à supprimer",
  })
  async delete(@Param('id') id: string): Promise<void> {
    try {
      await this.service.delete(id);
    } catch (error) {
      this.logger.error(`Erreur lors de la suppression de l'annonce: ${id}`, error.stack);
      throw error;
    }
  }

  @Delete('association/:associationId')
  @UseGuards(AuthGuard)
  @Roles(UserRole.ASSOCIATION)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Supprimer toutes les annonces d’une association par son ID' })
  @ApiParam({
    name: 'associationId',
    required: true,
    description: "ID de l'association dont les annonces doivent être supprimées",
  })
  async deleteByAssociationId(@Param('associationId') associationId: string): Promise<void> {
    try {
      await this.service.deleteByAssociationId(associationId);
    } catch (error) {
      this.logger.error(
        `Erreur lors de la suppression des annonces de l'association: ${associationId}`,
        error.stack,
      );
      throw error;
    }
  }

  @Patch('volunteer/register/:announcementId')
  @UseGuards(AuthGuard)
  @Roles(UserRole.VOLUNTEER, UserRole.ASSOCIATION, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Inscrire un bénévole à une annonce' })
  @ApiParam({
    name: 'announcementId',
    required: true,
    description: "ID de l'annonce",
  })
  @ApiBody({
    type: InfoVolunteerDto,
    description: 'Informations du bénévole',
  })
  @ApiResponse({
    status: 200,
    description: 'Bénévole inscrit avec succès',
    type: InfoVolunteerDto,
  })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  async addVolunteer(
    @Param('announcementId') announcementId: string,
    @Body() volunteer: InfoVolunteerDto,
  ): Promise<InfoVolunteer> {
    try {
      return await this.service.registerVolunteer(announcementId, volunteer);
    } catch (error) {
      this.logger.error(`Erreur lors de l'inscription du bénévole: ${announcementId}`, error.stack);
      throw error;
    }
  }

  @Patch('updateAnnouncementVisibility/:associationId/:eventVisibility')
  @UseGuards(AuthGuard)
  @Roles(UserRole.ASSOCIATION)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update an announcement visibility' })
  @ApiBody({
    type: UpdateVisibilityAnnouncementAssociationDTO,
    description: 'Informations de l’annonce à mettre à jour',
  })
  async updateAnnouncementVisibility(
    @Param('associationId') associationId: string,
    @Param('eventVisibility') eventVisibility: boolean,
  ): Promise<void> {
    try {
      await this.service.updateAnnouncementAssociationVisibility(associationId, eventVisibility);
    } catch (error) {
      this.logger.error(`Erreur lors de la mise à jour de la visibilité de l'annonce`, error.stack);
      throw error;
    }
  }

  @Patch('volunteerWaiting/register/:announcementId')
  @UseGuards(AuthGuard)
  @Roles(UserRole.VOLUNTEER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Register a volunteer to an announcement waiting list' })
  @ApiBody({ type: InfoVolunteerDto })
  @ApiParam({
    name: 'announcementId',
    required: true,
    description: "Identifiant de l'annonce",
  })
  @ApiResponse({
    status: 200,
    description: 'Bénévole inscrit en attente avec succès',
    type: InfoVolunteerDto,
  })
  async addVolunteerWaiting(
    @Param('announcementId') announcementId: string,
    @Body() volunteer: InfoVolunteer,
  ): Promise<InfoVolunteer> {
    try {
      return await this.service.registerVolunteerWaiting(announcementId, volunteer);
    } catch (error) {
      this.logger.error(
        `Erreur lors de l'inscription du bénévole en attente: ${announcementId}`,
        error.stack,
      );
      throw error;
    }
  }

  @Patch('volunteer/presence/:announcementId')
  @UseGuards(AuthGuard)
  @Roles(UserRole.VOLUNTEER, UserRole.ASSOCIATION, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Enregistrer la présence d’un bénévole à une annonce' })
  @ApiParam({
    name: 'announcementId',
    required: true,
    description: "ID de l'annonce",
  })
  @ApiBody({
    type: InfoVolunteerDto,
    description: 'Informations du bénévole',
  })
  @ApiResponse({
    status: 200,
    description: 'Présence du bénévole enregistrée avec succès',
    type: InfoVolunteerDto,
  })
  async addPresenceVolunteer(
    @Param('announcementId') announcementId: string,
    @Body() volunteer: InfoVolunteerDto,
  ): Promise<InfoVolunteer> {
    try {
      return await this.service.updatePresentVolunteer(volunteer, announcementId);
    } catch (error) {
      this.logger.error(
        `Erreur lors de l'enregistrement de la présence du bénévole: ${announcementId}`,
        error.stack,
      );
      throw error;
    }
  }

  @Patch('participant/presence/:announcementId')
  @UseGuards(AuthGuard)
  @Roles(UserRole.VOLUNTEER, UserRole.ASSOCIATION, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Enregistrer la présence d’un participant à une annonce' })
  @ApiParam({
    name: 'announcementId',
    required: true,
    description: "ID de l'annonce",
  })
  @ApiBody({
    type: InfoVolunteerDto,
    description: 'Informations du participant',
  })
  @ApiResponse({
    status: 200,
    description: 'Présence du participant enregistrée avec succès',
    type: InfoVolunteerDto,
  })
  async addPresenceParticipant(
    @Param('announcementId') announcementId: string,
    @Body() participant: InfoVolunteerDto,
  ): Promise<InfoVolunteer> {
    try {
      return await this.service.updatePresentParticipant(participant, announcementId);
    } catch (error) {
      this.logger.error(
        `Erreur lors de l'enregistrement de la présence du participant: ${announcementId}`,
        error.stack,
      );
      throw error;
    }
  }

  @Patch('participant/register/:announcementId')
  @UseGuards(AuthGuard)
  @Roles(UserRole.VOLUNTEER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Enregistrer un participant à une annonce' })
  @ApiParam({
    name: 'announcementId',
    required: true,
    description: "Identifiant de l'annonce",
  })
  @ApiBody({
    type: InfoVolunteerDto,
    description: 'Informations du participant à enregistrer',
  })
  @ApiResponse({
    status: 200,
    description: 'Participant inscrit avec succès',
    type: InfoVolunteerDto,
  })
  async addParticipant(
    @Param('announcementId') announcementId: string,
    @Body() participant: InfoVolunteerDto,
  ): Promise<InfoVolunteer> {
    try {
      return await this.service.registerParticipant(announcementId, participant);
    } catch (error) {
      this.logger.error(
        `Erreur lors de l'inscription du participant: ${announcementId}`,
        error.stack,
      );
      throw error;
    }
  }

  @Patch('volunteer/unregister/:volunteer/:announcementId')
  @UseGuards(AuthGuard)
  @Roles(UserRole.VOLUNTEER, UserRole.ASSOCIATION, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Désinscrire un bénévole d’une annonce' })
  @ApiParam({
    name: 'announcementId',
    required: true,
    description: "ID de l'annonce",
  })
  @ApiResponse({
    status: 201,
    description: 'Participant désinscrit avec succès',
    type: String,
  })
  async removeVolunteer(
    @Param('announcementId') announcementId: string,
    @Param('volunteer') volunteer: string,
  ): Promise<string> {
    try {
      return await this.service.removeVolunteer(announcementId, volunteer);
    } catch (error) {
      this.logger.error(
        `Erreur lors de la désinscription du bénévole: ${announcementId}`,
        error.stack,
      );
      throw error;
    }
  }

  @Patch('/participant/unregister/:participant/:announcementId')
  @UseGuards(AuthGuard)
  @Roles(UserRole.VOLUNTEER, UserRole.ASSOCIATION, UserRole.ADMIN)
  @ApiOperation({ summary: 'Désinscrire un participant d’une annonce' })
  @ApiParam({
    name: 'announcementId',
    required: true,
    description: "ID de l'annonce",
  })
  @ApiResponse({
    status: 200,
    description: 'Participant désinscrit avec succès',
    type: String,
  })
  async removeParticipant(
    @Param('announcementId') announcementId: string,
    @Param('participant') participant: string,
  ): Promise<string> {
    try {
      return await this.service.removeParticipant(announcementId, participant);
    } catch (error) {
      this.logger.error(
        `Erreur lors de la désinscription du participant: ${announcementId}`,
        error.stack,
      );
      throw error;
    }
  }

  @Patch('/volunteerWaiting/unregister/:volunteer/:announcementId')
  @UseGuards(AuthGuard)
  @Roles(UserRole.VOLUNTEER, UserRole.ASSOCIATION, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Désinscrire un bénévole de la liste d’attente d’une annonce' })
  @ApiParam({
    name: 'announcementId',
    required: true,
    description: "ID de l'annonce",
  })
  @ApiResponse({
    status: 200,
    description: 'Participant désinscrit avec succès',
    type: String,
  })
  async removeVolunteerWaiting(
    @Param('announcementId') announcementId: string,
    @Param('volunteer') volunteer: string,
  ): Promise<string> {
    try {
      return await this.service.removeVolunteerWaiting(announcementId, volunteer);
    } catch (error) {
      this.logger.error(
        `Erreur lors de la désinscription du bénévole en attente: ${announcementId}`,
        error.stack,
      );
      throw error;
    }
  }

  @Patch('/coverAnnouncement/:id')
  @UseGuards(AuthGuard)
  @Roles(UserRole.ASSOCIATION)
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Mettre à jour l’image de couverture d’une annonce' })
  @ApiParam({
    name: 'id',
    required: true,
    description: "ID de l'annonce",
  })
  @ApiBody({
    description: 'Image de couverture de l’annonce',
    type: 'multipart/form-data',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Image de couverture mise à jour avec succès',
    type: Announcement,
  })
  async updateImageCoverAnnouncement(
    @Param('id') id: string,
    @UploadedFile() file,
  ): Promise<Announcement> {
    try {
      const submittedFile = fileSchema.parse(file);
      return await this.service.updateAvatar(id, submittedFile);
    } catch (error) {
      this.logger.error(
        "Erreur lors de la mise à jour de l'image de profil de l'annonce",
        error.stack,
      );
      throw error;
    }
  }

  @Patch('/updateStatus/:announcementId')
  @UseGuards(AuthGuard)
  @Roles(UserRole.ASSOCIATION)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mettre à jour le statut d’une annonce' })
  @ApiParam({
    name: 'announcementId',
    required: true,
    description: "ID de l'annonce",
  })
  @ApiBody({
    description: 'Nouveau statut de l’annonce',
    type: String,
    enum: AnnouncementStatus,
  })
  @ApiResponse({
    status: 200,
    description: 'Statut de l’annonce mis à jour avec succès',
    type: Announcement,
  })
  async updateStatus(
    @Param('announcementId') announcementId: string,
    @Body('status') status: AnnouncementStatus,
  ): Promise<Announcement> {
    try {
      return await this.service.updateStatus(announcementId, status);
    } catch (error) {
      this.logger.error(`Erreur lors de la mise à jour du statut: ${announcementId}`, error.stack);
      throw error;
    }
  }
}
