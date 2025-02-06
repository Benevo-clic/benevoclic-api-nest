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
} from '@nestjs/common';
import { UserService } from '../services/user.service';
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

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Public()
  @Post('register')
  @UsePipes(new ValidationPipe({ transform: true }))
  registerUser(@Body() registerUserDto: RegisterUserDto) {
    try {
      return this.userService.registerUser(registerUserDto);
    } catch (error) {
      console.error(
        `Erreur lors de la création de l'utilisateur: ${registerUserDto.email}`,
        error.stack,
      );
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
      console.error(`Erreur lors de la connexion de l'utilisateur: ${loginDto.email}`, error.stack);
    }
  }

  @Get()
  @UseGuards(AuthGuard)
  @Roles(UserRole.ADMIN)
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
      console.error('Erreur lors de la récupération des bénévoles', error.stack);
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
      console.error('Erreur lors de la récupération des associations', error.stack);
    }
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  @Roles(UserRole.ADMIN, UserRole.ASSOCIATION, UserRole.VOLUNTEER)
  @ApiBearerAuth()
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  @Roles(UserRole.ADMIN, UserRole.ASSOCIATION, UserRole.VOLUNTEER)
  @ApiBearerAuth()
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    try {
      return await this.userService.update(id, updateUserDto);
    } catch (error) {
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
      console.error(
        `Erreur lors de la mise à jour de l'image de profil de l'utilisateur: ${id}`,
        error.stack,
      );
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
      console.error(
        `Erreur lors de la mise à jour de la localisation de l'utilisateur: ${id}`,
        error.stack,
      );
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
      console.error(
        `Erreur lors de la récupération de l'image de profil de l'utilisateur: ${id}`,
        error.stack,
      );
    }
  }
}
