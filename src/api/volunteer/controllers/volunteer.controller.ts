import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Logger,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { VolunteerService } from '../services/volunteer.service';
import { CreateVolunteerDto } from '../dto/create-volunteer.dto';
import { UpdateVolunteerDto } from '../dto/update-volunteer.dto';
import { AuthGuard } from '../../../guards/auth.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../../common/enums/roles.enum';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Public } from '../../../common/decorators/public.decorator';

@Controller('volunteer')
export class VolunteerController {
  private readonly logger = new Logger(VolunteerController.name);

  constructor(private readonly volunteerService: VolunteerService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AuthGuard)
  @Roles(UserRole.VOLUNTEER)
  @ApiBearerAuth()
  async create(@Body() createVolunteerDto: CreateVolunteerDto) {
    try {
      return await this.volunteerService.create(createVolunteerDto);
    } catch (error) {
      this.logger.error(
        `Erreur lors de la création du bénévole: ${createVolunteerDto.email}`,
        error.stack,
      );
      throw error;
    }
  }

  @Public()
  @Get('nb-volunteer')
  @HttpCode(HttpStatus.OK)
  async getNumberOfVolunteers(): Promise<{ nbVolunteer: number }> {
    try {
      const nbVolunteers = await this.volunteerService.getNumberOfVolunteers();
      return {
        nbVolunteer: nbVolunteers,
      };
    } catch (error) {
      this.logger.error('Erreur lors de la récupération du nombre de bénévoles', error.stack);
      throw error;
    }
  }

  @Get()
  @UseGuards(AuthGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  async findAll() {
    try {
      return await this.volunteerService.findAll();
    } catch (error) {
      this.logger.error(`Erreur lors de la récupération des bénévoles`, error.stack);
      throw error;
    }
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  @Roles(UserRole.ADMIN, UserRole.VOLUNTEER)
  @ApiBearerAuth()
  async findOne(@Param('id') id: string) {
    try {
      return await this.volunteerService.findOne(id);
    } catch (error) {
      this.logger.error(`Erreur lors de la récupération du bénévole ${id}`, error.stack);
      throw error;
    }
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  @Roles(UserRole.VOLUNTEER)
  @ApiBearerAuth()
  async update(@Param('id') id: string, @Body() updateVolunteerDto: UpdateVolunteerDto) {
    try {
      return await this.volunteerService.update(id, updateVolunteerDto);
    } catch (error) {
      this.logger.error(`Erreur lors de la mise à jour du bénévole ${id}`, error.stack);
      throw error;
    }
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @Roles(UserRole.VOLUNTEER)
  @ApiBearerAuth()
  async remove(@Param('id') id: string) {
    try {
      return await this.volunteerService.remove(id);
    } catch (error) {
      this.logger.error(`Erreur lors de la suppression du bénévole ${id}`, error.stack);
      throw error;
    }
  }
}
