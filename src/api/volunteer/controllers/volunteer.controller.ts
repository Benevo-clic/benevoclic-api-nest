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
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { VolunteerService } from '../services/volunteer.service';
import { CreateVolunteerDto } from '../dto/create-volunteer.dto';
import { UpdateVolunteerDto } from '../dto/update-volunteer.dto';
import { AuthGuard } from '../../../guards/auth.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../../common/enums/roles.enum';
import { ApiBearerAuth } from '@nestjs/swagger';

@UsePipes(
  new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }),
)
@Controller('volunteer')
export class VolunteerController {
  private readonly logger = new Logger(VolunteerController.name);
  constructor(private readonly volunteerService: VolunteerService) {}

  @Post()
  @UseGuards(AuthGuard)
  @Roles(UserRole.VOLUNTEER)
  @ApiBearerAuth()
  create(@Body() createVolunteerDto: CreateVolunteerDto) {
    try {
      return this.volunteerService.create(createVolunteerDto);
    } catch (error) {
      this.logger.error(
        `Erreur lors de la création du bénévole: ${createVolunteerDto.email}`,
        error.stack,
      );
      throw error;
    }
  }

  @Get()
  @UseGuards(AuthGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  findAll() {
    return this.volunteerService.findAll();
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  @Roles(UserRole.ADMIN, UserRole.VOLUNTEER)
  @ApiBearerAuth()
  findOne(@Param('id') id: string) {
    return this.volunteerService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  @Roles(UserRole.VOLUNTEER)
  @ApiBearerAuth()
  update(@Param('id') id: string, @Body() updateVolunteerDto: UpdateVolunteerDto) {
    try {
      return this.volunteerService.update(id, updateVolunteerDto);
    } catch (error) {
      this.logger.error(`Erreur lors de la mise à jour du bénévole: ${id}`, error.stack);
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
      this.logger.error(`Erreur lors de la suppression du bénévole: ${id}`, error.stack);
      throw error;
    }
  }
}
