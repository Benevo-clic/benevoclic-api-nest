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
    return this.associationService.create(createAssociationDto);
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

  @Patch(':associationId')
  @UseGuards(AuthGuard)
  @Roles(UserRole.ADMIN, UserRole.ASSOCIATION)
  @ApiBearerAuth()
  update(
    @Param('associationId') associationId: string,
    @Body() updateAssociationDto: UpdateAssociationDto,
  ) {
    return this.associationService.update(associationId, updateAssociationDto);
  }

  @Delete(':associationId')
  @UseGuards(AuthGuard)
  @Roles(UserRole.ADMIN, UserRole.ASSOCIATION)
  @ApiBearerAuth()
  remove(@Param('associationId') associationId: string) {
    return this.associationService.remove(associationId);
  }

  @Patch(':associationId/addAssociationVolunteers/:volunteers')
  @UseGuards(AuthGuard)
  @Roles(UserRole.ASSOCIATION)
  @ApiBearerAuth()
  addAssociationVolunteers(
    @Param('associationId') associationId: string,
    @Body() volunteers: InfoUserDto,
  ) {
    return this.associationService.addVolunteer(associationId, volunteers);
  }

  @Patch(':associationId/removeAssociationVolunteers/:volunteers')
  @UseGuards(AuthGuard)
  @Roles(UserRole.ADMIN, UserRole.ASSOCIATION, UserRole.VOLUNTEER)
  @ApiBearerAuth()
  async removeAssociationVolunteers(
    @Param('associationId') associationId: string,
    @Param('volunteers') volunteers: string,
  ) {
    return await this.associationService.removeVolunteer(associationId, volunteers);
  }

  @Patch(':associationId/addAssociationVolunteersWaiting/:volunteers')
  @UseGuards(AuthGuard)
  @Roles(UserRole.ADMIN, UserRole.ASSOCIATION, UserRole.VOLUNTEER)
  @ApiBearerAuth()
  addAssociationVolunteersWaiting(
    @Param('associationId') associationId: string,
    @Body() volunteers: InfoUserDto,
  ) {
    return this.associationService.addVolunteerWaiting(associationId, volunteers);
  }

  @Patch(':associationId/removeAssociationVolunteersWaiting/:volunteer')
  @UseGuards(AuthGuard)
  @Roles(UserRole.ADMIN, UserRole.ASSOCIATION, UserRole.VOLUNTEER)
  @ApiBearerAuth()
  removeAssociationVolunteersWaiting(
    @Param('associationId') associationId: string,
    @Param('volunteer') volunteer: string,
  ) {
    return this.associationService.removeVolunteerWaiting(associationId, volunteer);
  }
}
