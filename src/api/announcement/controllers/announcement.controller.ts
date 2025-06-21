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
    return this.service.findAll();
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
    return this.service.findById(id);
  }

  @Post()
  @UseGuards(AuthGuard)
  @Roles(UserRole.ASSOCIATION)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new announcement' })
  @ApiBody({ type: CreateAnnouncementDto })
  async create(@Body() announcement: CreateAnnouncementDto): Promise<Announcement> {
    return this.service.create(announcement);
  }

  @Get('association/:associationId')
  @UseGuards(AuthGuard)
  @Roles(UserRole.ASSOCIATION)
  @ApiBearerAuth()
  async findByAssociationId(
    @Param('associationId') associationId: string,
  ): Promise<Announcement[]> {
    return this.service.findByAssociationId(associationId);
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
    return this.service.update(id, announcement);
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<boolean> {
    return this.service.delete(id);
  }

  @Delete('association/:associationId')
  @UseGuards(AuthGuard)
  @Roles(UserRole.ASSOCIATION)
  @ApiBearerAuth()
  async deleteByAssociationId(@Param('associationId') associationId: string): Promise<boolean> {
    return this.service.deleteByAssociationId(associationId);
  }

  @Patch('/register/volunteer/:announcementId')
  @UseGuards(AuthGuard)
  @Roles(UserRole.VOLUNTEER)
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
    return this.service.registerVolunteer(announcementId, volunteer);
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
    return this.service.registerVolunteerWaiting(announcementId, volunteer);
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
    return this.service.registerParticipant(announcementId, participant);
  }

  @Patch('/unregister/volunteer/:volunteer/:announcementId')
  @UseGuards(AuthGuard)
  @Roles(UserRole.VOLUNTEER)
  @ApiBearerAuth()
  async removeVolunteer(
    @Param('announcementId') announcementId: string,
    @Param('volunteer') volunteer: string,
  ): Promise<string> {
    return this.service.removeVolunteer(announcementId, volunteer);
  }

  @Patch('/unregister/participant/:participant/:announcementId')
  @UseGuards(AuthGuard)
  @Roles(UserRole.VOLUNTEER)
  @ApiBearerAuth()
  async removeParticipant(
    @Param('announcementId') announcementId: string,
    @Param('participant') participant: string,
  ): Promise<string> {
    return this.service.removeParticipant(announcementId, participant);
  }

  @Patch('/unregister/volunteerWaiting/:volunteer/:announcementId')
  @UseGuards(AuthGuard)
  @Roles(UserRole.VOLUNTEER)
  @ApiBearerAuth()
  async removeVolunteerWaiting(
    @Param('announcementId') announcementId: string,
    @Param('volunteer') volunteer: string,
  ): Promise<string> {
    return this.service.removeVolunteerWaiting(announcementId, volunteer);
  }

  @Patch(':id/image-announcement')
  @UseGuards(AuthGuard)
  @Roles(UserRole.ASSOCIATION)
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('image'))
  async updateImageCoverAnnouncement(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    try {
      return await this.service.updateCover(id, file);
    } catch (error) {
      this.logger.error(
        "Erreur lors de la mise à jour de l'image de profil de l'annonce",
        error.stack,
      );
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
    return this.service.updateStatus(announcementId, status);
  }
}
