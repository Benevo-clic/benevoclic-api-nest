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
      console.error(
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
      console.error(
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
      console.error(
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
      console.error(
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
      console.error(
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
      console.error(
        `Erreur lors de l'ajout de bénévoles à l'association: ${associationId}`,
        error.stack,
      );
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
      console.error(
        `Erreur lors de la suppression de bénévoles de l'association: ${associationId}`,
        error.stack,
      );
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
      console.error(
        `Erreur lors de l'ajout de bénévoles en attente à l'association: ${associationId}`,
        error.stack,
      );
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
      console.error(
        `Erreur lors de la récupération des associations en attente du bénévole: ${volunteerId}`,
        error.stack,
      );
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
      console.error(
        `Erreur lors de la suppression de bénévoles en attente de l'association: ${associationId}`,
        error.stack,
      );
    }
  }
}
