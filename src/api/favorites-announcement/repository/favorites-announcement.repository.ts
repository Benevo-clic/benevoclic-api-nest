import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FavoritesAnnouncement } from '../entities/favorites-announcement.entity';

@Injectable()
export class FavoritesAnnouncementRepository {
  constructor(
    @InjectRepository(FavoritesAnnouncement)
    private readonly repository: Repository<FavoritesAnnouncement>,
  ) {}

  async findByVolunteerIdAndAnnouncementId(volunteerId: string, announcementId: string) {
    if (typeof volunteerId !== 'string' || typeof announcementId !== 'string') {
      throw new Error('Invalid input: volunteerId and announcementId must be strings');
    }
    return await this.repository.findOneBy({ volunteerId, announcementId });
  }

  async create(favoritesAnnouncement: FavoritesAnnouncement) {
    const created = this.repository.create(favoritesAnnouncement);
    return await this.repository.save(created);
  }

  async findAll() {
    return await this.repository.find();
  }

  async removeByVolunteerIdAndAnnouncementId(volunteerId: string, announcementId: string) {
    const result = await this.repository.delete({ volunteerId, announcementId });
    return { deletedCount: result.affected };
  }

  async removeByVolunteerId(volunteerId: string) {
    const result = await this.repository.delete({ volunteerId });
    return { deletedCount: result.affected };
  }

  async removeByAssociationId(associationId: string) {
    // Delete favorites where announcementId belongs to the association
    // Using a subquery
    const result = await this.repository
      .createQueryBuilder()
      .delete()
      .from(FavoritesAnnouncement)
      .where(
        'announcementId IN (SELECT id FROM announcements WHERE "associationId" = :associationId)',
        { associationId },
      )
      .execute();
    return { deletedCount: result.affected };
  }

  async removeByAnnouncementId(announcementId: string) {
    const result = await this.repository.delete({ announcementId });
    return { deletedCount: result.affected };
  }

  async findAllByVolunteerId(volunteerId: string) {
    return await this.repository.findBy({ volunteerId });
  }

  async findAllByAnnouncementId(announcementId: string) {
    return await this.repository.findBy({ announcementId });
  }
}
