import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UsePipes,
  ValidationPipe,
  UseGuards,
  Query,
  Request,
  UseInterceptors,
  UploadedFile,
  Logger,
} from '@nestjs/common';
import { UserService } from '../../../common/services/user/user.service';
import { UpdateUserDto } from '../dto/update-user.dto';
import { RegisterUserDto } from '../dto/register-user.dto';
import { LoginDto } from '../dto/login.dto';
import { AuthGuard } from '../../../guards/auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../../common/enums/roles.enum';
import { Public } from '../../../common/decorators/public.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { Location } from '../../../common/type/usersInfo.type';
import { RegisterUserVerifiedDto } from '../dto/register-user-verified.dto';
import { RegisterUserGoogleDto } from '../dto/register-user-google.dto';

@Controller('user')
export class UserController {
  private readonly logger = new Logger(UserController.name);
  constructor(private readonly userService: UserService) {}

  @Public()
  @Post('register')
  @UsePipes(new ValidationPipe({ transform: true }))
  registerUser(@Body() registerUserDto: RegisterUserDto) {
    try {
      return this.userService.registerUser(registerUserDto);
    } catch (error) {
      this.logger.error(
        `Erreur lors de la création de l'utilisateur: ${registerUserDto.email}`,
        error.stack,
      );
      throw error;
    }
  }

  @Public()
  @Post('register-user-verified')
  @UsePipes(new ValidationPipe({ transform: true }))
  registerUserVerified(@Body() registerUserDto: RegisterUserVerifiedDto) {
    try {
      return this.userService.registerWithEmailAndPasswordVerification(registerUserDto);
    } catch (error) {
      this.logger.error(
        `Erreur lors de la création de l'utilisateur: ${registerUserDto.email}`,
        error.stack,
      );
      throw error;
    }
  }

  @Public()
  @Post('register-google')
  @UsePipes(new ValidationPipe({ transform: true }))
  registerGoogle(@Body() registerUserDto: RegisterUserGoogleDto) {
    try {
      return this.userService.registerWithGoogle(registerUserDto);
    } catch (error) {
      this.logger.error(
        `Erreur lors de la création de l'utilisateur: ${registerUserDto.role}`,
        error.stack,
      );
      throw error;
    }
  }

  @Get('current-user')
  @Roles(UserRole.ADMIN, UserRole.ASSOCIATION, UserRole.VOLUNTEER)
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  async getCurrentUser(@Request() req) {
    try {
      return this.userService.getCurrentUser(req);
    } catch (error) {
      this.logger.error(`Erreur lors de la recuperation de l'utilisateur`, error.stack);
      throw error;
    }
  }

  @Public()
  @Post('refresh-auth')
  refreshAuth(@Query('refreshToken') refreshToken: string) {
    return this.userService.refreshAuthToken(refreshToken);
  }

  @Public()
  @Post('login')
  @UsePipes(new ValidationPipe({ transform: true }))
  login(@Body() loginDto: LoginDto) {
    try {
      return this.userService.loginUser(loginDto);
    } catch (error) {
      this.logger.error(
        `Erreur lors de la connexion de l'utilisateur: ${loginDto.email}`,
        error.stack,
      );
      throw error;
    }
  }

  @Get()
  @UseGuards(AuthGuard)
  @Roles(UserRole.ADMIN, UserRole.ASSOCIATION, UserRole.VOLUNTEER)
  @ApiBearerAuth()
  findAll() {
    return this.userService.findAll();
  }

  @Get('volunteers')
  @UseGuards(AuthGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  findVolunteers() {
    try {
      return this.userService.findByRole(UserRole.VOLUNTEER);
    } catch (error) {
      this.logger.error('Erreur lors de la récupération des bénévoles', error.stack);
      throw error;
    }
  }

  @Get('association')
  @UseGuards(AuthGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  findAssociation() {
    try {
      return this.userService.findByRole(UserRole.ASSOCIATION);
    } catch (error) {
      this.logger.error('Erreur lors de la récupération des associations', error.stack);
      throw error;
    }
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  @Roles(UserRole.ADMIN, UserRole.ASSOCIATION, UserRole.VOLUNTEER)
  @ApiBearerAuth()
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Get('email/:email')
  @UseGuards(AuthGuard)
  @Roles(UserRole.ADMIN, UserRole.ASSOCIATION, UserRole.VOLUNTEER)
  @ApiBearerAuth()
  findByEmail(@Param('email') email: string) {
    return this.userService.findByEmail(email);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  @Roles(UserRole.ADMIN, UserRole.ASSOCIATION, UserRole.VOLUNTEER)
  @ApiBearerAuth()
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    try {
      return await this.userService.update(id, updateUserDto);
    } catch (error) {
      this.logger.error(`Erreur lors de la mise à jour de l'utilisateur: ${id}`, error.stack);
      throw error;
    }
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @Roles(UserRole.ADMIN, UserRole.ASSOCIATION, UserRole.VOLUNTEER)
  @ApiBearerAuth()
  async remove(@Param('id') id: string) {
    try {
      return await this.userService.remove(id);
    } catch (error) {
      this.logger.error(`Erreur lors de la suppression de l'utilisateur: ${id}`, error.stack);
      throw error;
    }
  }

  @Post('logout')
  @UseGuards(AuthGuard)
  @Roles(UserRole.ASSOCIATION, UserRole.VOLUNTEER)
  @ApiBearerAuth()
  async logout(@Request() req) {
    try {
      return await this.userService.logout(req.user.uid);
    } catch (error) {
      this.logger.error(
        `Erreur lors de la déconnexion de l'utilisateur: ${req.user.uid}`,
        error.stack,
      );
      throw error;
    }
  }

  @Patch(':id/image-profile')
  @UseGuards(AuthGuard)
  @Roles(UserRole.ADMIN, UserRole.ASSOCIATION, UserRole.VOLUNTEER)
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('image'))
  async updateProfileImage(@Param('id') id: string, @UploadedFile() file: Express.Multer.File) {
    try {
      return await this.userService.updateProfilePicture(id, file);
    } catch (error) {
      this.logger.error(
        `Erreur lors de la mise à jour de l'image de profil de l'utilisateur: ${id}`,
        error.stack,
      );
      throw error;
    }
  }

  @Patch(':id/location')
  @UseGuards(AuthGuard)
  @Roles(UserRole.ADMIN, UserRole.ASSOCIATION, UserRole.VOLUNTEER)
  @ApiBearerAuth()
  async updateLocation(@Param('id') id: string, @Body() location: Location) {
    try {
      return await this.userService.updateLocation(id, location);
    } catch (error) {
      this.logger.error(
        `Erreur lors de la mise à jour de la localisation de l'utilisateur: ${id}`,
        error.stack,
      );
      throw error;
    }
  }

  @Get(':id/profile-image')
  @UseGuards(AuthGuard)
  @Roles(UserRole.ADMIN, UserRole.ASSOCIATION, UserRole.VOLUNTEER)
  @ApiBearerAuth()
  async getProfileImage(@Param('id') id: string) {
    try {
      return await this.userService.getProfileImage(id);
    } catch (error) {
      this.logger.error(
        `Erreur lors de la récupération de l'image de profil de l'utilisateur: ${id}`,
        error.stack,
      );
      throw error;
    }
  }

  @Patch(':id/update-connected/:connected')
  @UseGuards(AuthGuard)
  @Roles(UserRole.ADMIN, UserRole.ASSOCIATION, UserRole.VOLUNTEER)
  @ApiBearerAuth()
  async updateConnected(@Param('id') id: string, @Param('connected') connected: string) {
    try {
      return await this.userService.updateConnectionStatus(id, connected === 'true');
    } catch (error) {
      this.logger.error(
        `Erreur lors de la mise à jour de la connexion de l'utilisateur: ${id}`,
        error.stack,
      );
      throw error;
    }
  }
}
