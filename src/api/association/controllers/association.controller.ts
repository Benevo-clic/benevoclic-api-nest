import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AssociationService } from '../services/association.service';
import { CreateAssociationDto } from '../dto/create-association.dto';
import { UpdateAssociationDto } from '../dto/update-association.dto';
import { AuthGuard } from '../../../guards/auth.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../../common/enums/roles.enum';
import { ApiBearerAuth, ApiBody, ApiResponse } from '@nestjs/swagger';
import { Association } from '../entities/association.entity';
import { InfoUserDto } from '../dto/info-user.dto';
import { Public } from '../../../common/decorators/public.decorator';

@Controller('association')
export class AssociationController {
  private readonly logger = new Logger(AssociationController.name);

  constructor(private readonly associationService: AssociationService) {}

  @Post('createAssociation')
  @UseGuards(AuthGuard)
  @Roles(UserRole.ASSOCIATION)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiBody({ type: CreateAssociationDto })
  create(@Body() createAssociationDto: CreateAssociationDto) {
    return this.associationService.create(createAssociationDto);
  }

  @Get('all')
  @UseGuards(AuthGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ type: [Association] })
  findAll(): Promise<Association[]> {
    return this.associationService.findAll();
  }

  @Public()
  @Get('nb-association')
  async getNumberOfAssociations(): Promise<{ nbAssociation: number }> {
    const nbAssociation = await this.associationService.getNumberOfAssociations();
    return {
      nbAssociation: nbAssociation,
    };
  }

  @Get('waiting-list/:associationId/:volunteerId')
  @UseGuards(AuthGuard)
  @Roles(UserRole.ADMIN, UserRole.VOLUNTEER)
  @ApiBearerAuth()
  getAssociationsWaitingList(
    @Param('associationId') associationId: string,
    @Param('volunteerId') volunteerId: string,
  ) {
    return this.associationService.getVolunteersInWaitingList(associationId, volunteerId);
  }

  @Get('volunteer-list/:associationId/:volunteerId')
  @UseGuards(AuthGuard)
  @Roles(UserRole.ADMIN, UserRole.VOLUNTEER)
  @ApiBearerAuth()
  getAssociationsVolunteerList(
    @Param('associationId') associationId: string,
    @Param('volunteerId') volunteerId: string,
  ) {
    return this.associationService.getAssociationsVolunteerList(associationId, volunteerId);
  }

  @Get('volunteer-waiting-list/all/:volunteerId')
  @UseGuards(AuthGuard)
  @Roles(UserRole.ADMIN, UserRole.VOLUNTEER)
  @ApiBearerAuth()
  async getAllAssociationsVolunteerFromWaitingList(@Param('volunteerId') volunteerId: string) {
    const associationByVolunteer =
      await this.associationService.getAllAssociationsVolunteerFromWaitingList(volunteerId);
    if (!associationByVolunteer) {
      throw new Error('No association found for this volunteer in waiting list');
    }

    return associationByVolunteer;
  }

  @Get('volunteer-list/:volunteerId')
  @UseGuards(AuthGuard)
  @Roles(UserRole.ADMIN, UserRole.VOLUNTEER, UserRole.ASSOCIATION)
  @ApiBearerAuth()
  async getAssociationVolunteersList(@Param('volunteerId') volunteerId: string) {
    const associationByVolunteer =
      await this.associationService.getAllAssociationsVolunteerFromList(volunteerId);

    if (!associationByVolunteer) {
      throw new Error('No association found for this volunteer');
    }

    return associationByVolunteer;
  }

  @Patch('update/:associationId')
  @UseGuards(AuthGuard)
  @Roles(UserRole.ADMIN, UserRole.ASSOCIATION)
  @ApiBearerAuth()
  @ApiBody({ type: UpdateAssociationDto })
  update(
    @Param('associationId') associationId: string,
    @Body() updateAssociationDto: UpdateAssociationDto,
  ) {
    return this.associationService.update(associationId, updateAssociationDto);
  }

  @Delete('delete/:associationId')
  @UseGuards(AuthGuard)
  @Roles(UserRole.ADMIN, UserRole.ASSOCIATION)
  @ApiBearerAuth()
  remove(@Param('associationId') associationId: string) {
    return this.associationService.remove(associationId);
  }

  @Patch('volunteer/add/:associationId')
  @UseGuards(AuthGuard)
  @Roles(UserRole.ASSOCIATION)
  @ApiBearerAuth()
  addAssociationVolunteers(
    @Param('associationId') associationId: string,
    @Body() volunteers: InfoUserDto,
  ) {
    return this.associationService.registerVolunteer(associationId, volunteers);
  }

  @Patch('volunteer/remove/:associationId/:volunteerId')
  @UseGuards(AuthGuard)
  @Roles(UserRole.ADMIN, UserRole.ASSOCIATION, UserRole.VOLUNTEER)
  @ApiBearerAuth()
  removeAssociationVolunteers(
    @Param('associationId') associationId: string,
    @Param('volunteerId') volunteerId: string,
  ) {
    return this.associationService.removeVolunteer(associationId, volunteerId);
  }

  @Patch('volunteer-waiting/register/:associationId')
  @UseGuards(AuthGuard)
  @Roles(UserRole.ADMIN, UserRole.ASSOCIATION, UserRole.VOLUNTEER)
  @ApiBearerAuth()
  addAssociationVolunteersWaiting(
    @Param('associationId') associationId: string,
    @Body() volunteers: InfoUserDto,
  ) {
    return this.associationService.addVolunteerWaiting(associationId, volunteers);
  }

  @Patch('volunteer-waiting/remove/:associationId/:volunteer')
  @UseGuards(AuthGuard)
  @Roles(UserRole.ADMIN, UserRole.ASSOCIATION, UserRole.VOLUNTEER)
  @ApiBearerAuth()
  removeAssociationVolunteersWaiting(
    @Param('associationId') associationId: string,
    @Param('volunteer') volunteer: string,
  ) {
    return this.associationService.removeVolunteerWaiting(associationId, volunteer);
  }

  @Get('waiting/by-volunteer/:volunteerId')
  @UseGuards(AuthGuard)
  @Roles(UserRole.VOLUNTEER)
  @ApiBearerAuth()
  getAssociationWaiting(@Param('volunteerId') volunteerId: string) {
    return this.associationService.getAssociationWaitingByVolunteer(volunteerId);
  }

  @Get('by-volunteer/:volunteerId')
  @UseGuards(AuthGuard)
  @Roles(UserRole.VOLUNTEER)
  @ApiBearerAuth()
  getAssociation(@Param('volunteerId') volunteerId: string) {
    return this.associationService.getAssociationByVolunteer(volunteerId);
  }

  @Public()
  @Get('by-id/:associationId')
  @ApiResponse({ type: Association })
  findOne(@Param('associationId') associationId: string) {
    return this.associationService.findOne(associationId);
  }
}
