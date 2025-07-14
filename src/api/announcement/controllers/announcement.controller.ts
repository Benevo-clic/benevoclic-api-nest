import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Patch,
  UseInterceptors,
  UploadedFile,
  Logger,
} from '@nestjs/common';
import { AnnouncementService } from '../services/announcement.service';
import { Public } from '../../../common/decorators/public.decorator';
import { AuthGuard } from '../../../guards/auth.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../../common/enums/roles.enum';
import {
  ApiBearerAuth,
  ApiBody,
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';
import { Announcement } from '../entities/announcement.entity';
import { CreateAnnouncementDto } from '../dto/create-announcement.dto';
import { UpdateAnnouncementDto } from '../dto/update-announcement.dto';
import { InfoVolunteer } from '../../association/type/association.type';
import { InfoVolunteerDto } from '../../association/dto/info-volunteer.dto';
import { AnnouncementStatus } from '../interfaces/announcement.interface';
import { FileInterceptor } from '@nestjs/platform-express';
import { fileSchema } from '../../../common/utils/file-utils';

@ApiTags('announcements')
@Controller('announcements')
export class AnnouncementController {
  private readonly logger = new Logger('AnnouncementController');
  constructor(private readonly service: AnnouncementService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Récupérer toutes les annonces' })
  @ApiResponse({
    status: 200,
    description: 'Liste des annonces récupérée avec succès',
    type: [Announcement],
  })
  async findAll(): Promise<Announcement[]> {
    try {
      return await this.service.findAll();
    } catch (error) {
      this.logger.error('Erreur lors de la récupération des annonces', error.stack);
      throw error;
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer une annonce par son ID' })
  @ApiParam({ name: 'id', description: "ID de l'annonce" })
  @ApiResponse({
    status: 200,
    description: 'Annonce trouvée',
    type: Announcement,
  })
  @ApiResponse({ status: 404, description: 'Annonce non trouvée' })
  async findById(@Param('id') id: string): Promise<Announcement> {
    try {
      return await this.service.findById(id);
    } catch (error) {
      this.logger.error(`Erreur lors de la récupération de l'annonce: ${id}`, error.stack);
      throw error;
    }
  }

  @Post()
  @UseGuards(AuthGuard)
  @Roles(UserRole.ASSOCIATION)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new announcement' })
  @ApiBody({ type: CreateAnnouncementDto })
  async create(@Body() announcement: CreateAnnouncementDto): Promise<string> {
    try {
      return await this.service.create(announcement);
    } catch (error) {
      this.logger.error("Erreur lors de la création de l'annonce", error.stack);
      throw error;
    }
  }

  @Get('association/:associationId')
  @UseGuards(AuthGuard)
  @Roles(UserRole.ASSOCIATION)
  @ApiBearerAuth()
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

  @Patch(':id')
  @UseGuards(AuthGuard)
  @Roles(UserRole.ASSOCIATION)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update an announcement' })
  @ApiBody({ type: UpdateAnnouncementDto })
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

  @Patch('/register/volunteer/:announcementId')
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
  @ApiResponse({ status: 404, description: 'Annonce non trouvée' })
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

  @Patch('/register/volunteerWaiting/:announcementId')
  @UseGuards(AuthGuard)
  @Roles(UserRole.VOLUNTEER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Register a volunteer to an announcement waiting list' })
  @ApiBody({ type: InfoVolunteerDto })
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

  @Patch('/register/participant/:announcementId')
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

  @Patch('/unregister/volunteer/:volunteer/:announcementId')
  @UseGuards(AuthGuard)
  @Roles(UserRole.VOLUNTEER, UserRole.ASSOCIATION, UserRole.ADMIN)
  @ApiBearerAuth()
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

  @Patch('/unregister/participant/:participant/:announcementId')
  @UseGuards(AuthGuard)
  @Roles(UserRole.VOLUNTEER, UserRole.ASSOCIATION, UserRole.ADMIN)
  @ApiBearerAuth()
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

  @Patch('/unregister/volunteerWaiting/:volunteer/:announcementId')
  @UseGuards(AuthGuard)
  @Roles(UserRole.VOLUNTEER, UserRole.ASSOCIATION, UserRole.ADMIN)
  @ApiBearerAuth()
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

  @Patch('/cover-announcement/:id')
  @UseGuards(AuthGuard)
  @Roles(UserRole.ASSOCIATION)
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('file'))
  async updateImageCoverAnnouncement(@Param('id') id: string, @UploadedFile() file) {
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
  async updateStatus(
    @Param('announcementId') announcementId: string,
    @Body('status') status: AnnouncementStatus,
  ) {
    try {
      return await this.service.updateStatus(announcementId, status);
    } catch (error) {
      this.logger.error(`Erreur lors de la mise à jour du statut: ${announcementId}`, error.stack);
      throw error;
    }
  }
}
