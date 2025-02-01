import { Injectable } from '@nestjs/common';
import { AnnouncementRepository } from './announcement.repository';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';

@Injectable()
export class AnnouncementService {
  constructor(private readonly repository: AnnouncementRepository) {}

  async findAll() {
    return this.repository.findAll();
  }

  async create(createAnnouncementDto: CreateAnnouncementDto) {
    return this.repository.create(createAnnouncementDto);
  }
}
