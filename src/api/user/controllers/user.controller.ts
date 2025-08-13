import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
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
import { User } from '../entities/user.entity';
import { fileSchema } from '../../../common/utils/file-utils';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Public()
  @Post('register')
  @UsePipes(new ValidationPipe({ transform: true }))
  registerUser(@Body() dto: RegisterUserDto) {
    return this.userService.registerUser(dto);
  }

  @Public()
  @Post('register-user-verified')
  @UsePipes(new ValidationPipe({ transform: true }))
  registerUserVerified(@Body() dto: RegisterUserVerifiedDto) {
    return this.userService.registerWithEmailAndPasswordVerification(dto);
  }

  @Public()
  @Post('register-google')
  @UsePipes(new ValidationPipe({ transform: true }))
  registerGoogle(@Body() dto: RegisterUserGoogleDto) {
    return this.userService.registerWithGoogle(dto);
  }

  @Public()
  @Post('login')
  @UsePipes(new ValidationPipe({ transform: true }))
  login(@Body() dto: LoginDto) {
    return this.userService.loginUser(dto);
  }

  @Public()
  @Post('refresh')
  refreshAuth(@Body() body: { refreshToken: string }) {
    if (!body?.refreshToken) throw new Error('Refresh token is not provided');
    return this.userService.refreshAuthToken(body.refreshToken);
  }

  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN, UserRole.ASSOCIATION, UserRole.VOLUNTEER)
  @Get('current-user')
  getCurrentUser(@Request() req) {
    return this.userService.getCurrentUser(req);
  }

  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @Get('volunteers')
  findVolunteers() {
    return this.userService.findByRole(UserRole.VOLUNTEER);
  }

  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @Get('association')
  findAssociation() {
    return this.userService.findByRole(UserRole.ASSOCIATION);
  }

  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN, UserRole.ASSOCIATION, UserRole.VOLUNTEER)
  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN, UserRole.ASSOCIATION, UserRole.VOLUNTEER)
  @Get('email/:email')
  findByEmail(@Param('email') email: string) {
    return this.userService.findByEmail(email);
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN, UserRole.ASSOCIATION, UserRole.VOLUNTEER)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.userService.update(id, dto);
  }

  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN, UserRole.ASSOCIATION, UserRole.VOLUNTEER)
  @Patch(':id/location')
  updateLocation(@Param('id') id: string, @Body() location: Location) {
    return this.userService.updateLocation(id, location);
  }

  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN, UserRole.ASSOCIATION, UserRole.VOLUNTEER)
  @Patch(':id/isCompleted/:isCompleted')
  updateIsCompleted(@Param('id') id: string, @Param('isCompleted') status: string) {
    return this.userService.updateIsCompleted(id, status === 'true');
  }

  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN, UserRole.ASSOCIATION, UserRole.VOLUNTEER)
  @Patch(':id/update-connected/:connected')
  updateConnected(@Param('id') id: string, @Param('connected') connected: string) {
    return this.userService.updateConnectionStatus(id, connected === 'true');
  }

  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @Roles(UserRole.ASSOCIATION, UserRole.VOLUNTEER, UserRole.ADMIN)
  @Post('logout')
  logout(@Request() req) {
    return this.userService.logout(req.user.uid);
  }

  @Public()
  @UseInterceptors(FileInterceptor('file'))
  @Patch(':id/update-avatar')
  updateAvatarImage(@Param('id') id: string, @UploadedFile() file): Promise<User> {
    const submittedFile = fileSchema.parse(file);
    return this.userService.updateAvatar(id, submittedFile);
  }

  @Public()
  @Get('avatar/:id')
  getAvatar(@Param('id') id: string): Promise<string> {
    return this.userService.getAvatarFileUrl(id);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN, UserRole.ASSOCIATION, UserRole.VOLUNTEER)
  remove(@Param('id') id: string): Promise<{ uid: string }> {
    return this.userService.remove(id);
  }
}
