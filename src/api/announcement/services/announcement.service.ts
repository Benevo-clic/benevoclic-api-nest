import { Injectable, Logger } from '@nestjs/common';
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
  constructor(
    private readonly announcementRepository: AnnouncementRepository,
    private readonly userService: UserService,
  ) {}

  async findAll(): Promise<Announcement[]> {
    return this.announcementRepository.findAll();
  }

  async findById(id: string): Promise<Announcement> {
    return this.announcementRepository.findById(id);
  }

  async findByAssociationId(associationId: string): Promise<Announcement[]> {
    return this.announcementRepository.findByAssociationId(associationId);
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

    return this.announcementRepository.create({
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
  }

  async update(id: string, announcement: UpdateAnnouncementDto): Promise<Partial<Announcement>> {
    return this.announcementRepository.updateVolunteer(id, announcement);
  }

  async delete(id: string): Promise<boolean> {
    return this.announcementRepository.delete(id);
  }

  async deleteByAssociationId(associationId: string): Promise<boolean> {
    return this.announcementRepository.deleteByAssociationId(associationId);
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
    return participantId;
  }

  async updateStatus(id: string, status: AnnouncementStatus) {
    return await this.announcementRepository.updateStatus(id, status);
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

      this.logger.log(`Photo de profil mise à jour avec succès: ${image}`);

      return { message: `Photo de profil mise à jour avec succès: ${id}` };
    } catch (error) {
      this.logger.error(`Erreur lors de la mise à jour de la photo de profil: ${id}`, error.stack);
      throw new Error('Erreur lors de la mise à jour de la photo de profil');
    }
  }
}
