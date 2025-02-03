import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Patch } from '@nestjs/common';
import { AnnouncementService } from '../services/announcement.service';
import { Announcement } from '../interfaces/announcement.interface';
import { Public } from '../../../common/decorators/public.decorator';
import { AuthGuard } from '../../../guards/auth.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../../common/enums/roles.enum';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('announcements')
export class AnnouncementController {
  constructor(private readonly service: AnnouncementService) {}

  @Public()
  @Get()
  async findAll(): Promise<Announcement[]> {
    return this.service.findAll();
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<Announcement> {
    return this.service.findById(id);
  }

  @Post()
  @UseGuards(AuthGuard)
  @Roles(UserRole.ASSOCIATION)
  @ApiBearerAuth()
  async create(@Body() announcement: Omit<Announcement, '_id'>): Promise<Announcement> {
    return this.service.create(announcement);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() announcement: Partial<Announcement>,
  ): Promise<Announcement> {
    return this.service.update(id, announcement);
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<boolean> {
    return this.service.delete(id);
  }

}
