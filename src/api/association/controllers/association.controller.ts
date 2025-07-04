import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { AssociationService } from '../services/association.service';
import { CreateAssociationDto } from '../dto/create-association.dto';
import { UpdateAssociationDto } from '../dto/update-association.dto';
import { AuthGuard } from '../../../guards/auth.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../../common/enums/roles.enum';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Association } from '../entities/association.entity';
import { InfoUserDto } from '../dto/info-user.dto';

@Controller('/api/v2/association')
export class AssociationController {
  private readonly logger = new Logger(AssociationController.name);
  constructor(private readonly associationService: AssociationService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  @Roles(UserRole.ASSOCIATION)
  @ApiBearerAuth()
  create(@Body() createAssociationDto: CreateAssociationDto) {
    try {
      return this.associationService.create(createAssociationDto);
    } catch (error) {
      this.logger.error(
        `Erreur lors de la création de l'association: ${createAssociationDto.email}`,
        error.stack,
      );
    }
  }

  @Get()
  @UseGuards(AuthGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  findAll(): Promise<Association[]> {
    return this.associationService.findAll();
  }

  @Get(':associationId')
  @UseGuards(AuthGuard)
  @Roles(UserRole.ADMIN, UserRole.ASSOCIATION)
  @ApiBearerAuth()
  findOne(@Param('associationId') associationId: string) {
    return this.associationService.findOne(associationId);
  }

  @Get(':associationId/getAssociationsWaitingListVolunteer/:volunteerId')
  @UseGuards(AuthGuard)
  @Roles(UserRole.ADMIN, UserRole.VOLUNTEER)
  @ApiBearerAuth()
  getAssociationsWaitingList(
    @Param('associationId') associationId: string,
    @Param('volunteerId') volunteerId: string,
  ) {
    try {
      return this.associationService.getVolunteersInWaitingList(associationId, volunteerId);
    } catch (error) {
      this.logger.error(
        "Erreur lors de la récupération de la liste d'attente des associations: %s",
        associationId,
        error.stack,
      );
    }
  }

  @Get(':associationId/getAssociationsVolunteerList/:volunteerId')
  @UseGuards(AuthGuard)
  @Roles(UserRole.ADMIN, UserRole.VOLUNTEER)
  @ApiBearerAuth()
  getAssociationsVolunteerList(
    @Param('associationId') associationId: string,
    @Param('volunteerId') volunteerId: string,
  ) {
    try {
      return this.associationService.getAssociationsVolunteerList(associationId, volunteerId);
    } catch (error) {
      this.logger.error(
        `Erreur lors de la récupération de la liste d'attente des associations: ${associationId}`,
        error.stack,
      );
    }
  }

  @Patch(':associationId')
  @UseGuards(AuthGuard)
  @Roles(UserRole.ADMIN, UserRole.ASSOCIATION)
  @ApiBearerAuth()
  update(
    @Param('associationId') associationId: string,
    @Body() updateAssociationDto: UpdateAssociationDto,
  ) {
    try {
      return this.associationService.update(associationId, updateAssociationDto);
    } catch (error) {
      this.logger.error(
        `Erreur lors de la mise à jour de l'association: ${associationId}`,
        error.stack,
      );
    }
  }

  @Delete(':associationId')
  @UseGuards(AuthGuard)
  @Roles(UserRole.ADMIN, UserRole.ASSOCIATION)
  @ApiBearerAuth()
  remove(@Param('associationId') associationId: string) {
    try {
      return this.associationService.remove(associationId);
    } catch (error) {
      this.logger.error(
        `Erreur lors de la suppression de l'association: ${associationId}`,
        error.stack,
      );
    }
  }

  @Patch(':associationId/addAssociationVolunteers')
  @UseGuards(AuthGuard)
  @Roles(UserRole.ASSOCIATION)
  @ApiBearerAuth()
  async addAssociationVolunteers(
    @Param('associationId') associationId: string,
    @Body() volunteers: InfoUserDto,
  ) {
    try {
      return await this.associationService.registerVolunteer(associationId, volunteers);
    } catch (error) {
      this.logger.error(
        `Erreur lors de l'ajout de bénévoles à l'association: ${associationId}`,
        error.stack,
      );
      throw error;
    }
  }

  @Patch(':associationId/removeAssociationVolunteers/:volunteers')
  @UseGuards(AuthGuard)
  @Roles(UserRole.ADMIN, UserRole.ASSOCIATION, UserRole.VOLUNTEER)
  @ApiBearerAuth()
  async removeAssociationVolunteers(
    @Param('associationId') associationId: string,
    @Param('volunteers') volunteers: string,
  ) {
    try {
      return await this.associationService.removeVolunteer(associationId, volunteers);
    } catch (error) {
      this.logger.error(
        `Erreur lors de la suppression de bénévoles de l'association: ${associationId}`,
        error.stack,
      );
      throw error;
    }
  }

  @Get(':volunteerId/AllAssociationsVolunteerFromWaitingList')
  @UseGuards(AuthGuard)
  @Roles(UserRole.ADMIN, UserRole.VOLUNTEER)
  @ApiBearerAuth()
  getAllAssociationsVolunteerFromWaitingList(@Param('volunteerId') volunteerId: string) {
    try {
      return this.associationService.getAllAssociationsVolunteerFromWaitingList(volunteerId);
    } catch (error) {
      this.logger.error(
        `Erreur lors de la récupération des associations du bénévole depuis la liste d'attente: ${volunteerId}`,
        error.stack,
      );
      throw error;
    }
  }

  @Get(':volunteerId/getAssociationVolunteersList')
  @UseGuards(AuthGuard)
  @Roles(UserRole.ADMIN, UserRole.VOLUNTEER)
  @ApiBearerAuth()
  getAssociationVolunteersList(@Param('volunteerId') volunteerId: string) {
    try {
      return this.associationService.getAllAssociationsVolunteerFromList(volunteerId);
    } catch (error) {
      this.logger.error(
        "Erreur lors de la récupération de la liste des bénévoles de l'association: %s",
        volunteerId,
        error.stack,
      );
      throw error;
    }
  }

  @Patch(':associationId/addAssociationVolunteersWaiting')
  @UseGuards(AuthGuard)
  @Roles(UserRole.ADMIN, UserRole.ASSOCIATION, UserRole.VOLUNTEER)
  @ApiBearerAuth()
  addAssociationVolunteersWaiting(
    @Param('associationId') associationId: string,
    @Body() volunteers: InfoUserDto,
  ) {
    try {
      return this.associationService.addVolunteerWaiting(associationId, volunteers);
    } catch (error) {
      this.logger.error(
        `Erreur lors de l'ajout de bénévoles en attente à l'association: ${associationId}`,
        error.stack,
      );
      throw error;
    }
  }

  @Get(':volunteerId/getAssociationWaiting')
  @UseGuards(AuthGuard)
  @Roles(UserRole.VOLUNTEER)
  @ApiBearerAuth()
  getAssociationWaiting(@Param('volunteerId') volunteerId: string) {
    try {
      return this.associationService.getAssociationWaitingByVolunteer(volunteerId);
    } catch (error) {
      this.logger.error(
        `Erreur lors de la récupération des associations en attente du bénévole: ${volunteerId}`,
        error.stack,
      );
      throw error;
    }
  }

  @Get(':volunteerId/getAssociation')
  @UseGuards(AuthGuard)
  @Roles(UserRole.VOLUNTEER)
  @ApiBearerAuth()
  getAssociation(@Param('volunteerId') volunteerId: string) {
    return this.associationService.getAssociationByVolunteer(volunteerId);
  }

  @Patch(':associationId/removeAssociationVolunteersWaiting/:volunteer')
  @UseGuards(AuthGuard)
  @Roles(UserRole.ADMIN, UserRole.ASSOCIATION, UserRole.VOLUNTEER)
  @ApiBearerAuth()
  removeAssociationVolunteersWaiting(
    @Param('associationId') associationId: string,
    @Param('volunteer') volunteer: string,
  ) {
    try {
      return this.associationService.removeVolunteerWaiting(associationId, volunteer);
    } catch (error) {
      this.logger.error(
        `Erreur lors de la suppression de bénévoles en attente de l'association: ${associationId}`,
        error.stack,
      );
      throw error;
    }
  }
}
