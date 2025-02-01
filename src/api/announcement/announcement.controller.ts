import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { AnnouncementService } from './announcement.service';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums/roles.enum';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import { AuthGuard } from '../../guards/auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('announcements')
export class AnnouncementController {
  constructor(private readonly service: AnnouncementService) {}

  @Public()
  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Post()
  @UseGuards(AuthGuard)
  @Roles(UserRole.ASSOCIATION)
  @ApiBearerAuth()
  create(@Body() createAnnouncementDto: CreateAnnouncementDto) {
    return this.service.create(createAnnouncementDto);
  }
}
