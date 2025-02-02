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
    return this.userService.registerUser(registerUserDto);
  }

  @Post('refresh-auth')
  refreshAuth(@Query('refreshToken') refreshToken: string) {
    return this.userService.refreshAuthToken(refreshToken);
  }

  @Public()
  @Post('login')
  @UsePipes(new ValidationPipe({ transform: true }))
  login(@Body() loginDto: LoginDto) {
    return this.userService.loginUser(loginDto);
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
    return this.userService.findByRole(UserRole.VOLUNTEER);
  }

  @Get('association')
  @UseGuards(AuthGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  findAssociation() {
    return this.userService.findByRole(UserRole.ASSOCIATION);
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
    return await this.userService.update(id, updateUserDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @Roles(UserRole.ADMIN, UserRole.ASSOCIATION, UserRole.VOLUNTEER)
  @ApiBearerAuth()
  async remove(@Param('id') id: string) {
    return await this.userService.remove(id);
  }

  @Post('logout')
  @UseGuards(AuthGuard)
  @Roles(UserRole.ASSOCIATION, UserRole.VOLUNTEER)
  @ApiBearerAuth()
  async logout(@Request() req) {
    return await this.userService.logout(req.user.uid);
  }

  @Patch(':id/image-profile')
  @UseGuards(AuthGuard)
  @Roles(UserRole.ADMIN, UserRole.ASSOCIATION, UserRole.VOLUNTEER)
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('image'))
  async updateProfileImage(@Param('id') id: string, @UploadedFile() file: Express.Multer.File) {
    return await this.userService.updateProfilePicture(id, file);
  }

  @Patch(':id/location')
  @UseGuards(AuthGuard)
  @Roles(UserRole.ADMIN, UserRole.ASSOCIATION, UserRole.VOLUNTEER)
  @ApiBearerAuth()
  async updateLocation(@Param('id') id: string, @Body() location: Location) {
    return await this.userService.updateLocation(id, location);
  }
  @Get(':id/profile-image')
  async getProfileImage(@Param('id') id: string) {
    return await this.userService.getProfileImage(id);
  }
}
