import { Body, Controller, Delete, Get, Logger, Param, Post, UseGuards } from '@nestjs/common';
import { FavoritesAnnouncementService } from '../services/favorites-announcement.service';
import { AuthGuard } from '../../../guards/auth.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../../common/enums/roles.enum';
import { ApiBearerAuth } from '@nestjs/swagger';
import { CreateFavoritesAnnouncementDto } from '../dto/create-favorites-announcement.dto';

@Controller('favorites-announcement')
export class FavoritesAnnouncementController {
  private readonly logger = new Logger(FavoritesAnnouncementController.name);

  constructor(private readonly favoritesAnnouncementService: FavoritesAnnouncementService) {}

  @Post()
  @UseGuards(AuthGuard)
  @Roles(UserRole.VOLUNTEER)
  @ApiBearerAuth()
  create(@Body() createFavoritesAnnouncementDto: CreateFavoritesAnnouncementDto) {
    try {
      return this.favoritesAnnouncementService.create(createFavoritesAnnouncementDto);
    } catch (error) {
      this.logger.error(
        `Erreur lors de la création de l'annonce favorite: ${createFavoritesAnnouncementDto.announcementId}`,
        error.stack,
      );
    }
  }

  @Get()
  @UseGuards(AuthGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  findAll() {
    return this.favoritesAnnouncementService.findAll();
  }

  @Get(':volunteerId')
  @UseGuards(AuthGuard)
  @Roles(UserRole.ADMIN, UserRole.VOLUNTEER)
  @ApiBearerAuth()
  findAllByVolunteerId(@Param('volunteerId') volunteerId: string) {
    return this.favoritesAnnouncementService.findAllByVolunteerId(volunteerId);
  }

  @Get(':announcementId')
  @UseGuards(AuthGuard)
  @Roles(UserRole.ADMIN, UserRole.VOLUNTEER)
  @ApiBearerAuth()
  findAllByAnnouncementId(@Param('announcementId') announcementId: string) {
    return this.favoritesAnnouncementService.findAllByAnnouncementId(announcementId);
  }

  @Get(':volunteerId/:announcementId')
  @UseGuards(AuthGuard)
  @Roles(UserRole.ADMIN, UserRole.VOLUNTEER)
  @ApiBearerAuth()
  findByVolunteerIdAndAnnouncementId(
    @Param('volunteerId') volunteerId: string,
    @Param('announcementId') announcementId: string,
  ) {
    return this.favoritesAnnouncementService.findByVolunteerIdAndAnnouncementId(
      volunteerId,
      announcementId,
    );
  }

  @Get(':volunteerId/favoritesVolunteer')
  @UseGuards(AuthGuard)
  @Roles(UserRole.ADMIN, UserRole.VOLUNTEER)
  @ApiBearerAuth()
  findByVolunteerIdAllFavoritesAnnouncement(@Param('volunteerId') volunteerId: string) {
    return this.favoritesAnnouncementService.findByVolunteerIdAllFavoritesAnnouncement(volunteerId);
  }

  @Delete(':volunteerId/:announcementId')
  @UseGuards(AuthGuard)
  @Roles(UserRole.VOLUNTEER)
  @ApiBearerAuth()
  removeByVolunteerIdAndAnnouncementId(
    @Param('volunteerId') volunteerId: string,
    @Param('announcementId') announcementId: string,
  ) {
    try {
      return this.favoritesAnnouncementService.removeByVolunteerIdAndAnnouncementId(
        volunteerId,
        announcementId,
      );
    } catch (error) {
      this.logger.error(
        `Erreur lors de la suppression de l'annonce favorite: ${announcementId}`,
        error.stack,
      );
    }
  }

  @Delete(':volunteerId')
  @UseGuards(AuthGuard)
  @Roles(UserRole.VOLUNTEER)
  @ApiBearerAuth()
  removeAllByVolunteerId(@Param('volunteerId') volunteerId: string) {
    try {
      return this.favoritesAnnouncementService.removeByVolunteerId(volunteerId);
    } catch (error) {
      this.logger.error(
        `Erreur lors de la suppression de l'annonce favorite: ${volunteerId}`,
        error.stack,
      );
    }
  }

  @Delete(':announcementId')
  @UseGuards(AuthGuard)
  @Roles(UserRole.VOLUNTEER)
  @ApiBearerAuth()
  removeAllByAnnouncementId(@Param('announcementId') announcementId: string) {
    try {
      return this.favoritesAnnouncementService.removeByAnnouncementId(announcementId);
    } catch (error) {
      this.logger.error(
        `Erreur lors de la suppression de l'annonce favorite: ${announcementId}`,
        error.stack,
      );
    }
  }
}
