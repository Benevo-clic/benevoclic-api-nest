import { Injectable } from '@nestjs/common';
import { AnnouncementRepository } from '../repositories/announcement.repository';
import { Announcement } from '../interfaces/announcement.interface';

@Injectable()
export class AnnouncementService {
  constructor(private readonly repository: AnnouncementRepository) {}

  async findAll(): Promise<Announcement[]> {
    return this.repository.findAll();
  }

  async findById(id: string): Promise<Announcement> {
    return this.repository.findById(id);
  }

  async create(announcement: Omit<Announcement, '_id'>): Promise<Announcement> {
    return this.repository.create(announcement);
  }

  async update(id: string, announcement: Partial<Announcement>): Promise<Announcement> {
    return this.repository.update(id, announcement);
  }

  async delete(id: string): Promise<boolean> {
    return this.repository.delete(id);
  }
}
