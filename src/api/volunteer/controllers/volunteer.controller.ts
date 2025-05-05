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
import { Public } from '../../../common/decorators/public.decorator';
import { LoginDto } from '../../user/dto/login.dto';
import { UserService } from '../../../common/services/user/user.service';

@Controller('volunteer')
export class VolunteerController {
  private readonly logger = new Logger(VolunteerController.name);
  constructor(
    private readonly volunteerService: VolunteerService,
    private readonly userService: UserService,
  ) {}

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
    }
  }

  @Public()
  @Post('login')
  @UsePipes(new ValidationPipe({ transform: true }))
  login(@Body() loginDto: LoginDto) {
    try {
      if (loginDto.role === UserRole.VOLUNTEER) {
        return this.userService.loginUser(loginDto);
      } else {
        return {
          message: 'Vous devez être un bénévole pour vous connecter',
        };
      }
    } catch (error) {
      console.error(`Erreur lors de la connexion de l'utilisateur: ${loginDto.email}`, error.stack);
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
    }
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @Roles(UserRole.VOLUNTEER)
  @ApiBearerAuth()
  remove(@Param('id') id: string) {
    try {
      return this.volunteerService.remove(id);
    } catch (error) {
      this.logger.error(`Erreur lors de la suppression du bénévole: ${id}`, error.stack);
    }
  }
}
