import { Injectable, Logger, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { AnnouncementRepository } from '../repositories/announcement.repository';
import { CreateAnnouncementDto } from '../dto/create-announcement.dto';
import { Announcement } from '../entities/announcement.entity';
import { UpdateAnnouncementDto } from '../dto/update-announcement.dto';
import { InfoVolunteer } from '../../association/type/association.type';
import { AnnouncementStatus } from '../interfaces/announcement.interface';
import { Image } from '../../../common/type/usersInfo.type';
import { UserService } from '../../../common/services/user/user.service';

@Injectable()
export class AnnouncementService {
  private readonly logger = new Logger(AnnouncementService.name);
  private readonly CACHE_KEYS = {
    ALL_ANNOUNCEMENTS: 'allAnnouncements',
    ANNOUNCEMENT_BY_ID: (id: string) => `announcement:${id}`,
    ANNOUNCEMENTS_BY_ASSOCIATION: (associationId: string) =>
      `announcements:association:${associationId}`,
  };

  constructor(
    private readonly announcementRepository: AnnouncementRepository,
    private readonly userService: UserService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async findAll(): Promise<Announcement[]> {
    // Cache-aside pattern: check cache first
    const cachedAnnouncements = await this.cacheManager.get<Announcement[]>(
      this.CACHE_KEYS.ALL_ANNOUNCEMENTS,
    );

    if (cachedAnnouncements) {
      this.logger.log('Cache hit for all announcements');
      return cachedAnnouncements;
    }

    // Cache miss: query database
    this.logger.log('Cache miss for all announcements, querying database');
    const announcements = await this.announcementRepository.findAll();

    // Cache the result
    await this.cacheManager.set(this.CACHE_KEYS.ALL_ANNOUNCEMENTS, announcements);

    return announcements;
  }

  async findById(id: string): Promise<Announcement> {
    // Cache-aside pattern for individual announcements
    const cacheKey = this.CACHE_KEYS.ANNOUNCEMENT_BY_ID(id);
    const cachedAnnouncement = await this.cacheManager.get<Announcement>(cacheKey);

    if (cachedAnnouncement) {
      this.logger.log(`Cache hit for announcement ${id}`);
      return cachedAnnouncement;
    }

    // Cache miss: query database
    this.logger.log(`Cache miss for announcement ${id}, querying database`);
    const announcement = await this.announcementRepository.findById(id);

    if (announcement) {
      // Cache the result
      await this.cacheManager.set(cacheKey, announcement);
    }

    return announcement;
  }

  async findByAssociationId(associationId: string): Promise<Announcement[]> {
    // Cache-aside pattern for association announcements
    const cacheKey = this.CACHE_KEYS.ANNOUNCEMENTS_BY_ASSOCIATION(associationId);
    const cachedAnnouncements = await this.cacheManager.get<Announcement[]>(cacheKey);

    if (cachedAnnouncements) {
      this.logger.log(`Cache hit for association announcements ${associationId}`);
      return cachedAnnouncements;
    }

    // Cache miss: query database
    this.logger.log(`Cache miss for association announcements ${associationId}, querying database`);
    const announcements = await this.announcementRepository.findByAssociationId(associationId);

    // Cache the result
    await this.cacheManager.set(cacheKey, announcements);

    return announcements;
  }

  async uploadProfileImage(file: Express.Multer.File): Promise<Image> {
    if (!file) {
      return null;
    }

    const base64Image = file.buffer.toString('base64');

    return {
      data: base64Image, // Image encodée en Base64
      contentType: file.mimetype,
      uploadedAt: new Date(),
    };
  }

  async create(announcement: CreateAnnouncementDto): Promise<string> {
    const associationLogo = await this.userService.getUserImageProfile(announcement.associationId);

    const result = await this.announcementRepository.create({
      associationId: announcement.associationId,
      description: announcement.description,
      datePublication: announcement.datePublication,
      dateEvent: announcement.dateEvent,
      hoursEvent: announcement.hoursEvent,
      nameEvent: announcement.nameEvent,
      tags: announcement.tags || [],
      associationName: announcement.associationName,
      associationLogo: associationLogo,
      announcementImage: null,
      locationAnnouncement: announcement.locationAnnouncement,
      participants: [],
      volunteers: [],
      volunteersWaiting: [],
      nbParticipants: 0,
      maxParticipants: announcement.maxParticipants,
      status: announcement.status,
      nbVolunteers: 0,
      maxVolunteers: announcement.maxVolunteers,
    });

    // Invalidate cache after creation
    await this.invalidateCache();

    return result;
  }

  async update(id: string, announcement: UpdateAnnouncementDto): Promise<Partial<Announcement>> {
    const result = await this.announcementRepository.updateVolunteer(id, announcement);

    // Invalidate cache after update
    await this.invalidateCache(id);

    return result;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.announcementRepository.delete(id);

    // Invalidate cache after deletion
    await this.invalidateCache(id);

    return result;
  }

  async deleteByAssociationId(associationId: string): Promise<boolean> {
    const result = await this.announcementRepository.deleteByAssociationId(associationId);

    // Invalidate cache after deletion
    await this.invalidateCache(null, associationId);

    return result;
  }

  async isCompletedVolunteer(announcement: Announcement): Promise<boolean> {
    return announcement.nbVolunteers >= announcement.maxVolunteers;
  }

  async isCompletedParticipant(announcement: Announcement): Promise<boolean> {
    return announcement.nbParticipants >= announcement.maxParticipants;
  }

  async isVolunteer(announcement: Announcement, volunteerId: string): Promise<boolean> {
    return announcement.volunteers.some(volunteer => volunteer.id === volunteerId);
  }

  async isVolunteerWaiting(announcement: Announcement, volunteerId: string): Promise<boolean> {
    return announcement.volunteersWaiting.some(volunteer => volunteer.id === volunteerId);
  }

  async registerVolunteer(id: string, volunteer: InfoVolunteer) {
    await this.removeVolunteerWaiting(id, volunteer.id);
    await this.addVolunteer(id, volunteer);
    return volunteer;
  }

  async addVolunteer(id: string, volunteer: InfoVolunteer) {
    const announcement = await this.announcementRepository.findById(id);
    if (await this.isCompletedVolunteer(announcement)) {
      throw new Error('Announcement is already completed');
    }
    if (await this.isVolunteer(announcement, volunteer.id)) {
      throw new Error('Volunteer already registered');
    }
    announcement.volunteers.push(volunteer);
    announcement.nbVolunteers++;
    await this.announcementRepository.updateVolunteer(id, announcement);

    // Invalidate cache after volunteer addition
    await this.invalidateCache(id);
  }

  async registerVolunteerWaiting(id: string, volunteer: InfoVolunteer): Promise<InfoVolunteer> {
    const announcement = await this.announcementRepository.findById(id);
    if (
      (await this.isVolunteer(announcement, volunteer.id)) ||
      (await this.isVolunteerWaiting(announcement, volunteer.id))
    ) {
      throw new Error('Volunteer already registered');
    }
    announcement.volunteersWaiting.push(volunteer);
    await this.announcementRepository.updateVolunteer(id, announcement);

    // Invalidate cache after volunteer waiting registration
    await this.invalidateCache(id);

    return volunteer;
  }

  async removeVolunteerWaiting(id: string, volunteerId: string): Promise<string> {
    const announcement = await this.announcementRepository.findById(id);
    if (!announcement) {
      throw new Error('Announcement not found');
    }
    if (!(await this.isVolunteerWaiting(announcement, volunteerId))) {
      throw new Error('Volunteer not registered');
    }
    await this.announcementRepository.removeVolunteerWaiting(id, volunteerId);

    // Invalidate cache after volunteer waiting removal
    await this.invalidateCache(id);

    return volunteerId;
  }

  async removeVolunteer(id: string, volunteerId: string): Promise<string> {
    const announcement = await this.announcementRepository.findById(id);
    if (!announcement) {
      throw new Error('Announcement not found');
    }
    if (!(await this.isVolunteer(announcement, volunteerId))) {
      throw new Error('Volunteer not registered');
    }

    await this.announcementRepository.removeVolunteer(
      id,
      volunteerId,
      announcement.nbVolunteers - 1,
    );

    // Invalidate cache after volunteer removal
    await this.invalidateCache(id);

    return volunteerId;
  }

  async registerParticipant(id: string, participant: InfoVolunteer) {
    const announcement = await this.announcementRepository.findById(id);
    if (await this.isCompletedParticipant(announcement)) {
      throw new Error('Announcement is already completed');
    }

    announcement.participants.push(participant);
    announcement.nbParticipants++;
    await this.announcementRepository.updateVolunteer(id, announcement);

    // Invalidate cache after participant registration
    await this.invalidateCache(id);

    return participant;
  }

  async isParticipant(announcement: Announcement, participantId: string): Promise<boolean> {
    return announcement.participants.some(participant => participant.id === participantId);
  }

  async removeParticipant(id: string, participantId: string) {
    const announcement = await this.announcementRepository.findById(id);
    if (!announcement) {
      throw new Error('Announcement not found');
    }
    if (!(await this.isParticipant(announcement, participantId))) {
      throw new Error('Participant not registered');
    }

    await this.announcementRepository.removeParticipant(
      id,
      participantId,
      announcement.nbParticipants - 1,
    );

    // Invalidate cache after participant removal
    await this.invalidateCache(id);

    return participantId;
  }

  async updateStatus(id: string, status: AnnouncementStatus) {
    const result = await this.announcementRepository.updateStatus(id, status);

    // Invalidate cache after status update
    await this.invalidateCache(id);

    return result;
  }

  async updateCover(id: string, file: Express.Multer.File) {
    try {
      if (!file) {
        throw new Error('Aucun fichier fourni.');
      }
      const image = await this.uploadProfileImage(file);
      await this.announcementRepository.update(id, {
        announcementImage: image,
      });

      // Invalidate cache after cover update
      await this.invalidateCache(id);

      this.logger.log(`Photo de profil mise à jour avec succès: ${id}`);

      return image;
    } catch (error) {
      this.logger.error(`Erreur lors de la mise à jour de la photo de profil: ${id}`, error.stack);
      throw new Error('Erreur lors de la mise à jour de la photo de profil');
    }
  }

  private async invalidateCache(id?: string, associationId?: string) {
    if (id) {
      await this.cacheManager.del(this.CACHE_KEYS.ANNOUNCEMENT_BY_ID(id));
    }
    if (associationId) {
      await this.cacheManager.del(this.CACHE_KEYS.ANNOUNCEMENTS_BY_ASSOCIATION(associationId));
    }
    await this.cacheManager.del(this.CACHE_KEYS.ALL_ANNOUNCEMENTS);
  }
}
