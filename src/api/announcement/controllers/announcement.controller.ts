import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { AnnouncementService } from '../services/announcement.service';
import { Announcement } from '../interfaces/announcement.interface';

@Controller('announcements')
export class AnnouncementController {
  constructor(private readonly service: AnnouncementService) {}

  @Get()
  async findAll(): Promise<Announcement[]> {
    return this.service.findAll();
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<Announcement> {
    return this.service.findById(id);
  }

  @Post()
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
