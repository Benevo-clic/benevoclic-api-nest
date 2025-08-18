import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import {
  AnnouncementRepository,
  FilterAnnouncementResponse,
} from '../repositories/announcement.repository';
import { CreateAnnouncementDto } from '../dto/create-announcement.dto';
import { Announcement } from '../entities/announcement.entity';
import { UpdateAnnouncementDto } from '../dto/update-announcement.dto';
import { InfoVolunteer } from '../../association/type/association.type';
import { AnnouncementStatus } from '../interfaces/announcement.interface';
import { UserService } from '../../../common/services/user/user.service';
import { FavoritesAnnouncementService } from '../../favorites-announcement/services/favorites-announcement.service';
import { z } from 'zod';
import { fileSchema } from '../../../common/utils/file-utils';
import { AwsS3Service } from '../../../common/aws/aws-s3.service';
import { FilterAnnouncementDto } from '../dto/filter-announcement.dto';
import { FilterAssociationAnnouncementDto } from '../dto/filter-association-announcement.dto';
import { InfoVolunteerDto } from '../../association/dto/info-volunteer.dto';
import { DateTime } from 'luxon';
import { SettingsService } from '../../settings/services/settings.service';

@Injectable()
export class AnnouncementService {
  private readonly logger = new Logger(AnnouncementService.name);

  private readonly nowParis = DateTime.now().setZone('Europe/Paris');

  constructor(
    private readonly announcementRepository: AnnouncementRepository,
    private readonly userService: UserService,
    @Inject(forwardRef(() => FavoritesAnnouncementService))
    private readonly favoritesAnnouncementService: FavoritesAnnouncementService,
    private readonly awsS3Service: AwsS3Service,
    private readonly settingsService: SettingsService,
  ) {}

  async findAll(): Promise<Announcement[]> {
    try {
      const announcements = await this.announcementRepository.findAll();
      if (!announcements || announcements.length === 0) {
        return [];
      }
      return await this.enrichVolunteerAnnouncements(announcements);
    } catch (error) {
      this.logger.error('Erreur lors de la récupération des annonces', error.stack);
      throw new InternalServerErrorException('Erreur lors de la récupération des annonces');
    }
  }

  async filterAnnouncementsAggregation(
    filterDto: FilterAnnouncementDto,
  ): Promise<FilterAnnouncementResponse> {
    try {
      const announcements = await this.announcementRepository.findWithAggregation(filterDto);
      return {
        annonces: await this.enrichVolunteerAnnouncements(announcements.annonces),
        meta: announcements.meta,
      };
    } catch (error) {
      this.logger.error('Erreur lors de la récupération des annonces filtrées', error.stack);
      throw new InternalServerErrorException(
        'Erreur lors de la récupération des annonces filtrées',
      );
    }
  }

  async filterAssociationAnnouncements(
    filterDto: FilterAssociationAnnouncementDto,
  ): Promise<FilterAnnouncementResponse> {
    try {
      const announcements =
        await this.announcementRepository.filterAssociationAnnouncements(filterDto);
      return {
        annonces: await this.enrichAnnouncements(announcements.annonces),
        meta: announcements.meta,
      };
    } catch (error) {
      this.logger.error(
        `Erreur lors de la récupération des annonces filtrées pour l'association: ${filterDto.associationId}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        "Erreur lors de la récupération des annonces filtrées pour l'association",
      );
    }
  }

  async enrichVolunteerAnnouncements(announcements: any[]) {
    await Promise.all(
      announcements.map(async announcement => {
        announcement.associationLogo = await this.userService.getAvatarFileUrl(
          announcement.associationId,
        );
        announcement.announcementImage = await this.getAvatarFileUrl(announcement?._id);
      }),
    );
    return announcements;
  }

  async enrichAnnouncements(announcements: any[]) {
    await Promise.all(
      announcements.map(async announcement => {
        announcement.associationLogo = await this.userService.getAvatarFileUrl(
          announcement.associationId,
        );
        announcement.announcementImage = await this.getAvatarFileUrl(announcement?._id);
      }),
    );
    return announcements;
  }

  async findById(id: string): Promise<Announcement> {
    try {
      const announcement = await this.announcementRepository.findById(id);
      if (!announcement) {
        throw new NotFoundException('Annonce non trouvée');
      }
      announcement.announcementImage = await this.getAvatarFileUrl(id);
      announcement.associationLogo = await this.userService.getAvatarFileUrl(
        announcement.associationId,
      );
      return announcement;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error(`Erreur lors de la récupération de l'annonce: ${id}`, error.stack);
      throw new InternalServerErrorException("Erreur lors de la récupération de l'annonce");
    }
  }

  async findByAssociationId(associationId: string): Promise<Announcement[]> {
    try {
      const announcements = await this.announcementRepository.findByAssociationId(associationId);

      if (!announcements || announcements.length === 0) {
        return [];
      }

      return await this.enrichAnnouncements(announcements);
    } catch (error) {
      this.logger.error(
        `Erreur lors de la récupération des annonces de l'association: ${associationId}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        "Erreur lors de la récupération des annonces de l'association",
      );
    }
  }

  async getAssociationSettings(associationId: string) {
    try {
      const settings = await this.settingsService.getAssociationSettings(associationId);
      if (!settings) {
        throw new NotFoundException('Paramètres de l’association non trouvés');
      }
      return settings;
    } catch (error) {
      this.logger.error(
        `Erreur lors de la récupération des paramètres de l'association: ${associationId}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        "Erreur lors de la récupération des paramètres de l'association",
      );
    }
  }

  async findVolunteerInAnnouncementByVolunteerId(volunteerId: string): Promise<Announcement[]> {
    try {
      const announcements =
        await this.announcementRepository.findVolunteerInAnnouncementByVolunteerId(volunteerId);
      if (!announcements || announcements.length === 0) {
        return [];
      }
      return await this.enrichVolunteerAnnouncements(announcements);
    } catch (error) {
      this.logger.error(
        `Erreur lors de la récupération des annonces pour le bénévole: ${volunteerId}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        'Erreur lors de la récupération des annonces pour le bénévole',
      );
    }
  }

  async findPastAnnouncementsByParticipantId(participantId: string): Promise<Announcement[]> {
    try {
      const announcements =
        await this.announcementRepository.findPastAnnouncementsByParticipantId(participantId);
      if (!announcements || announcements.length === 0) {
        return [];
      }
      return await this.enrichVolunteerAnnouncements(announcements);
    } catch (error) {
      this.logger.error(
        `Erreur lors de la récupération des annonces passées pour le participant: ${participantId}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        'Erreur lors de la récupération des annonces passées pour le participant',
      );
    }
  }

  async findParticipantInParticipantsByParticipantId(
    participantId: string,
  ): Promise<Announcement[]> {
    try {
      const announcements =
        await this.announcementRepository.findParticipantInParticipantsByParticipantId(
          participantId,
        );
      if (!announcements || announcements.length === 0) {
        return [];
      }
      return await this.enrichVolunteerAnnouncements(announcements);
    } catch (error) {
      this.logger.error(
        `Erreur lors de la récupération des annonces pour le participant: ${participantId}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        'Erreur lors de la récupération des annonces pour le participant',
      );
    }
  }

  async create(announcement: CreateAnnouncementDto): Promise<string> {
    try {
      const settings = await this.getAssociationSettings(announcement.associationId);
      const avatarFileKey = await this.userService.getAvatarFileUrl(announcement.associationId);
      return await this.announcementRepository.create({
        associationId: announcement.associationId,
        description: announcement.description,
        datePublication: announcement.datePublication,
        dateEvent: announcement.dateEvent,
        hoursEvent: announcement.hoursEvent,
        nameEvent: announcement.nameEvent,
        tags: announcement.tags || [],
        associationName: announcement.associationName,
        associationLogo: avatarFileKey,
        announcementImage: '',
        addressAnnouncement: announcement.addressAnnouncement,
        locationAnnouncement: announcement.locationAnnouncement,
        participants: [],
        volunteers: [],
        volunteersWaiting: [],
        nbParticipants: 0,
        maxParticipants: !settings.participantLimits ? -1 : announcement.maxParticipants,
        status: announcement.status,
        nbVolunteers: 0,
        maxVolunteers: !settings.volunteerLimits ? -1 : announcement.maxParticipants,
      });
    } catch (error) {
      this.logger.error("Erreur lors de la création de l'annonce", error.stack);
      throw new InternalServerErrorException("Erreur lors de la création de l'annonce");
    }
  }

  async update(id: string, announcement: UpdateAnnouncementDto): Promise<Partial<Announcement>> {
    try {
      return await this.announcementRepository.updateVolunteer(id, announcement);
    } catch (error) {
      this.logger.error(`Erreur lors de la mise à jour de l'annonce: ${id}`, error.stack);
      throw new InternalServerErrorException("Erreur lors de la mise à jour de l'annonce");
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const announcement = await this.announcementRepository.findById(id);
      if (!announcement) {
        throw new NotFoundException('Annonce non trouvée');
      }
      if (announcement.announcementImage && announcement.announcementImage !== '') {
        await this.awsS3Service.deleteFile(announcement.announcementImage);
      }
      await this.favoritesAnnouncementService.removeByAnnouncementId(id);
      await this.announcementRepository.delete(id);
    } catch (error) {
      this.logger.error(`Erreur lors de la suppression de l'annonce: ${id}`, error.stack);
      throw new InternalServerErrorException("Erreur lors de la suppression de l'annonce");
    }
  }

  async deleteByAssociationId(associationId: string): Promise<void> {
    try {
      const associationAnnouncements =
        await this.announcementRepository.findByAssociationId(associationId);
      if (!associationAnnouncements || associationAnnouncements.length === 0) {
        this.logger.warn(`Aucune annonce trouvée pour l'association: ${associationId}`);
        return;
      }
      await Promise.all([
        associationAnnouncements.map(async announcement => {
          if (announcement.announcementImage) {
            await this.awsS3Service.deleteFile(announcement.announcementImage);
          }
        }),
        this.favoritesAnnouncementService.removeByAssociationId(associationId),
      ]);
      await this.announcementRepository.deleteByAssociationId(associationId);
    } catch (error) {
      this.logger.error(
        `Erreur lors de la suppression des annonces de l'association: ${associationId}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        "Erreur lors de la suppression des annonces de l'association",
      );
    }
  }

  async updateAnnouncementAssociationName(associationId: string, associationName: string) {
    try {
      const announcements = await this.announcementRepository.findByAssociationId(associationId);
      if (!announcements || announcements.length === 0) {
        this.logger.warn(`Aucune annonce trouvée pour l'association: ${associationId}`);
        return;
      }
      await this.announcementRepository.updateAssociationNameByAssociationId(
        associationId,
        associationName,
      );
    } catch (error) {
      this.logger.error(
        `Erreur lors de la mise à jour du nom de l'association dans les annonces: ${associationId}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        "Erreur lors de la mise à jour du nom de l'association dans les annonces",
      );
    }
  }

  async updateAnnouncementAssociationVisibility(
    associationId: string,
    isVisible: boolean,
  ): Promise<void> {
    try {
      const announcements = await this.announcementRepository.findByAssociationId(associationId);
      if (!announcements || announcements.length === 0) {
        this.logger.warn(`Aucune annonce trouvée pour l'association: ${associationId}`);
        return;
      }
      await this.announcementRepository.updateAssociationVisibilityByAssociationId(
        associationId,
        !isVisible,
      );
    } catch (error) {
      this.logger.error(
        `Erreur lors de la mise à jour de la visibilité de l'association dans les annonces: ${associationId}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        "Erreur lors de la mise à jour de la visibilité de l'association dans les annonces",
      );
    }
  }

  isCompletedVolunteer(announcement: Announcement, isVolunteerLimits: boolean): boolean {
    try {
      if (!isVolunteerLimits || announcement.maxVolunteers === -1) {
        return false;
      }
      return announcement.nbVolunteers >= announcement.maxVolunteers;
    } catch (error) {
      this.logger.error('Erreur lors de la vérification du nombre de bénévoles', error.stack);
      throw new InternalServerErrorException(
        'Erreur lors de la vérification du nombre de bénévoles',
      );
    }
  }

  async isCompletedParticipant(
    announcement: Announcement,
    participantLimit: boolean,
  ): Promise<boolean> {
    try {
      if (!participantLimit || announcement.maxParticipants === -1) {
        return false;
      }
      return announcement.nbParticipants >= announcement.maxParticipants;
    } catch (error) {
      this.logger.error('Erreur lors de la vérification du nombre de participants', error.stack);
      throw new InternalServerErrorException(
        'Erreur lors de la vérification du nombre de participants',
      );
    }
  }

  async isVolunteer(announcement: Announcement, volunteerId: string): Promise<boolean> {
    try {
      return announcement.volunteers.some(volunteer => volunteer.id === volunteerId);
    } catch (error) {
      this.logger.error('Erreur lors de la vérification du bénévole', error.stack);
      throw new InternalServerErrorException('Erreur lors de la vérification du bénévole');
    }
  }

  async isVolunteerWaiting(announcement: Announcement, volunteerId: string): Promise<boolean> {
    try {
      return announcement.volunteersWaiting.some(volunteer => volunteer.id === volunteerId);
    } catch (error) {
      this.logger.error('Erreur lors de la vérification du bénévole en attente', error.stack);
      throw new InternalServerErrorException(
        'Erreur lors de la vérification du bénévole en attente',
      );
    }
  }

  async registerVolunteer(id: string, volunteer: InfoVolunteerDto) {
    try {
      const announcement = await this.announcementRepository.findById(id);
      const settings = await this.getAssociationSettings(announcement.associationId);

      if (this.isCompletedVolunteer(announcement, settings.volunteerLimits)) {
        throw new BadRequestException('Announcement is already completed');
      }
      if (!settings.autoApproveVolunteers) {
        await this.removeVolunteerWaiting(id, volunteer.id);
      }
      await this.addVolunteer(id, {
        id: volunteer.id,
        name: volunteer.name,
        isPresent: false,
      });
      return volunteer;
    } catch (error) {
      this.logger.error(`Erreur lors de l'inscription du bénévole: ${id}`, error.stack);
      throw new InternalServerErrorException("Erreur lors de l'inscription du bénévole");
    }
  }

  async addVolunteer(id: string, volunteer: InfoVolunteerDto) {
    try {
      const announcement = await this.announcementRepository.findById(id);

      if (await this.isVolunteer(announcement, volunteer.id)) {
        throw new BadRequestException('Volunteer already registered');
      }

      announcement.volunteers.push({
        id: volunteer.id,
        name: volunteer.name,
        isPresent: false,
        dateAdded: this.nowParis.toISODate(),
      });
      announcement.nbVolunteers++;
      announcement.status =
        announcement.nbVolunteers >= announcement.maxVolunteers &&
        announcement.nbParticipants >= announcement.maxParticipants
          ? AnnouncementStatus.COMPLETED
          : AnnouncementStatus.ACTIVE;
      await this.announcementRepository.updateVolunteer(id, announcement);
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      this.logger.error(`Erreur lors de l'ajout du bénévole: ${id}`, error.stack);
      throw new InternalServerErrorException("Erreur lors de l'ajout du bénévole");
    }
  }

  async registerVolunteerWaiting(id: string, volunteer: InfoVolunteer): Promise<InfoVolunteer> {
    try {
      const announcement = await this.announcementRepository.findById(id);
      const settings = await this.getAssociationSettings(announcement.associationId);

      if (
        (await this.isVolunteer(announcement, volunteer.id)) ||
        (await this.isVolunteerWaiting(announcement, volunteer.id))
      ) {
        throw new BadRequestException('Volunteer already registered');
      }
      if (settings.autoApproveVolunteers) {
        await this.addVolunteer(id, volunteer);
        return volunteer;
      }
      announcement.volunteersWaiting.push(volunteer);
      await this.announcementRepository.updateVolunteer(id, announcement);
      return volunteer;
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      this.logger.error(`Erreur lors de l'inscription du bénévole en attente: ${id}`, error.stack);
      throw new InternalServerErrorException("Erreur lors de l'inscription du bénévole en attente");
    }
  }

  async removeVolunteerWaiting(id: string, volunteerId: string): Promise<string> {
    try {
      const announcement = await this.announcementRepository.findById(id);
      const settings = await this.getAssociationSettings(announcement.associationId);

      if (!announcement) {
        throw new NotFoundException('Announcement not found');
      }
      if (settings.autoApproveVolunteers) {
        await this.removeVolunteer(id, volunteerId);
        return volunteerId;
      }
      if (!(await this.isVolunteerWaiting(announcement, volunteerId))) {
        throw new BadRequestException('Volunteer not registered');
      }

      await this.announcementRepository.removeVolunteerWaiting(id, volunteerId);
      return volunteerId;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) throw error;
      this.logger.error(`Erreur lors de la suppression du bénévole en attente: ${id}`, error.stack);
      throw new InternalServerErrorException(
        'Erreur lors de la suppression du bénévole en attente',
      );
    }
  }

  async removeVolunteer(id: string, volunteerId: string): Promise<string> {
    try {
      const announcement = await this.announcementRepository.findById(id);
      if (!announcement) {
        throw new NotFoundException('Announcement not found');
      }
      if (!(await this.isVolunteer(announcement, volunteerId))) {
        throw new BadRequestException('Volunteer not registered');
      }
      announcement.status =
        announcement.nbVolunteers - 1 >= announcement.maxVolunteers &&
        announcement.nbParticipants >= announcement.maxParticipants
          ? AnnouncementStatus.COMPLETED
          : AnnouncementStatus.ACTIVE;
      await this.announcementRepository.updateStatus(id, announcement.status);
      await this.announcementRepository.removeVolunteer(
        id,
        volunteerId,
        announcement.nbVolunteers - 1,
      );
      return volunteerId;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) throw error;
      this.logger.error(`Erreur lors de la suppression du bénévole: ${id}`, error.stack);
      throw new InternalServerErrorException('Erreur lors de la suppression du bénévole');
    }
  }

  async updatePresentParticipant(
    participant: InfoVolunteerDto,
    announcementId: string,
  ): Promise<InfoVolunteer> {
    try {
      const announcement = await this.announcementRepository.findById(announcementId);
      if (!announcement) {
        throw new NotFoundException('Announcement not found');
      }
      const participantIndex = announcement.participants.findIndex(p => p.id === participant.id);
      if (participantIndex === -1) {
        throw new BadRequestException('Participant not registered');
      }
      announcement.participants[participantIndex].isPresent = participant.isPresent;
      await this.announcementRepository.updateVolunteer(announcementId, announcement);
      return announcement.participants[participantIndex];
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) throw error;
      this.logger.error(
        `Erreur lors de la mise à jour de la présence du participant: ${participant.id}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        'Erreur lors de la mise à jour de la présence du participant',
      );
    }
  }

  async updatePresentVolunteer(
    volunteer: InfoVolunteerDto,
    announcementId: string,
  ): Promise<InfoVolunteer> {
    try {
      const announcement = await this.announcementRepository.findById(announcementId);
      if (!announcement) {
        throw new NotFoundException('Announcement not found');
      }
      const volunteerIndex = announcement.volunteers.findIndex(v => v.id === volunteer.id);
      if (volunteerIndex === -1) {
        throw new BadRequestException('Volunteer not registered');
      }
      announcement.volunteers[volunteerIndex].isPresent = volunteer.isPresent;
      await this.announcementRepository.updateVolunteer(announcementId, announcement);
      return announcement.volunteers[volunteerIndex];
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) throw error;
      this.logger.error(
        `Erreur lors de la mise à jour de la présence du bénévole: ${volunteer.id}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        'Erreur lors de la mise à jour de la présence du bénévole',
      );
    }
  }

  async registerParticipant(id: string, participant: InfoVolunteerDto) {
    try {
      const announcement = await this.announcementRepository.findById(id);
      const settings = await this.getAssociationSettings(announcement.associationId);

      if (await this.isCompletedParticipant(announcement, settings.participantLimits)) {
        throw new BadRequestException('Announcement is already completed');
      }

      announcement.participants.push({
        id: participant.id,
        name: participant.name,
        isPresent: false,
        dateAdded: this.nowParis.toISODate(),
      });
      announcement.nbParticipants++;
      announcement.status =
        announcement.nbVolunteers >= announcement.maxVolunteers &&
        announcement.nbParticipants >= announcement.maxParticipants
          ? AnnouncementStatus.COMPLETED
          : AnnouncementStatus.ACTIVE;
      await this.announcementRepository.updateVolunteer(id, announcement);
      return participant;
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      this.logger.error(`Erreur lors de l'inscription du participant: ${id}`, error.stack);
      throw new InternalServerErrorException("Erreur lors de l'inscription du participant");
    }
  }

  async isParticipant(announcement: Announcement, participantId: string): Promise<boolean> {
    try {
      return announcement.participants.some(participant => participant.id === participantId);
    } catch (error) {
      this.logger.error('Erreur lors de la vérification du participant', error.stack);
      throw new InternalServerErrorException('Erreur lors de la vérification du participant');
    }
  }

  async removeParticipant(id: string, participantId: string) {
    try {
      const announcement = await this.announcementRepository.findById(id);
      if (!announcement) {
        throw new NotFoundException('Announcement not found');
      }
      if (!(await this.isParticipant(announcement, participantId))) {
        throw new BadRequestException('Participant not registered');
      }
      announcement.status =
        announcement.nbVolunteers >= announcement.maxVolunteers &&
        announcement.nbParticipants - 1 >= announcement.maxParticipants
          ? AnnouncementStatus.COMPLETED
          : AnnouncementStatus.ACTIVE;
      await this.announcementRepository.updateStatus(id, announcement.status);
      await this.announcementRepository.removeParticipant(
        id,
        participantId,
        announcement.nbParticipants - 1,
      );
      return participantId;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) throw error;
      this.logger.error(`Erreur lors de la suppression du participant: ${id}`, error.stack);
      throw new InternalServerErrorException('Erreur lors de la suppression du participant');
    }
  }

  async updateStatus(id: string, status: AnnouncementStatus) {
    try {
      return await this.announcementRepository.updateStatus(id, status);
    } catch (error) {
      this.logger.error(`Erreur lors de la mise à jour du statut de l'annonce: ${id}`, error.stack);
      throw new InternalServerErrorException(
        "Erreur lors de la mise à jour du statut de l'annonce",
      );
    }
  }

  async updateAvatar(id: string, submittedFile: z.infer<typeof fileSchema>) {
    try {
      const existingUser = await this.announcementRepository.findById(id);
      if (!existingUser) {
        this.logger.error(`announcement non trouvé: ${id}`);
        throw new NotFoundException('Utilisateur non trouvé');
      }
      const { fileKey } = await this.awsS3Service.uploadFileAnnouncement(id, submittedFile);
      await this.announcementRepository.update(id, { announcementImage: fileKey });
      this.logger.log(`announce image mis à jour pour l'utilisateur: ${id}`);

      if (
        existingUser.announcementImage &&
        existingUser.announcementImage !== fileKey &&
        existingUser.announcementImage !== ''
      ) {
        await this.awsS3Service.deleteFile(existingUser.announcementImage);
        this.logger.log(`Ancien avatar supprimé pour l'utilisateur: ${id}`);
      }
      return this.announcementRepository.findById(id);
    } catch (error) {
      this.logger.error(`Erreur lors de la mise à jour de l'avatar: ${id}`, error.stack);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException("Erreur lors de la mise à jour de l'avatar");
    }
  }

  async getAvatarFileUrl(id: string): Promise<string> {
    try {
      const announcement = await this.announcementRepository.findById(id);
      if (!announcement || !announcement.announcementImage) {
        return '';
      }
      return await this.awsS3Service.getFileUrl(announcement.announcementImage);
    } catch (error) {
      this.logger.error(`Erreur lors de la récupération de l'URL de l'avatar: ${id}`, error.stack);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException("Erreur lors de la récupération de l'URL de l'avatar");
    }
  }

  async removeVolunteerEverywhere(volunteerId: string): Promise<number> {
    try {
      return await this.announcementRepository.removeVolunteerEverywhere(volunteerId);
    } catch (error) {
      this.logger.error(
        `Erreur lors de la suppression du bénévole ${volunteerId} dans toutes les annonces`,
        error.stack,
      );
      throw new InternalServerErrorException(
        'Erreur lors de la suppression du bénévole dans toutes les annonces',
      );
    }
  }

  async removeParticipantEverywhere(participantId: string): Promise<number> {
    try {
      return await this.announcementRepository.removeParticipantEverywhere(participantId);
    } catch (error) {
      this.logger.error(
        `Erreur lors de la suppression du participant ${participantId} dans toutes les annonces`,
        error.stack,
      );
      throw new InternalServerErrorException(
        'Erreur lors de la suppression du participant dans toutes les annonces',
      );
    }
  }
}
