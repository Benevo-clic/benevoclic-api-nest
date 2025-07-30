import {
  Injectable,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
  Logger,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { CreateAssociationDto } from '../dto/create-association.dto';
import { UpdateAssociationDto } from '../dto/update-association.dto';
import { Association } from '../entities/association.entity';
import { AssociationRepository } from '../repository/association.repository';
import { FirebaseAdminService } from '../../../common/firebase/firebaseAdmin.service';
import { VolunteerAssociationFollowing } from '../type/association.type';
import { FindAssociationDto } from '../dto/find-association.dto';
import { AnnouncementService } from '../../announcement/services/announcement.service';

@Injectable()
export class AssociationService {
  private readonly logger = new Logger(AssociationService.name);
  firebaseInstance: FirebaseAdminService = FirebaseAdminService.getInstance();

  constructor(
    private readonly associationRepository: AssociationRepository,
    @Inject(forwardRef(() => AnnouncementService))
    private readonly announcementService: AnnouncementService,
  ) {}

  async create(createAssociationDto: CreateAssociationDto) {
    try {
      const firebaseUser = await this.firebaseInstance.getUserByEmail(createAssociationDto.email);
      if (!firebaseUser) {
        throw new NotFoundException('Email not found');
      }
      const isExist: Association = await this.associationRepository.findById(firebaseUser.uid);
      if (isExist) {
        throw new BadRequestException('Email already exist');
      }
      const emailExist = await this.associationRepository.findByEmail(createAssociationDto.email);
      if (emailExist) {
        throw new BadRequestException('Email already exist');
      }
      return await this.associationRepository.create({
        associationId: firebaseUser.uid,
        bio: createAssociationDto.bio,
        phone: createAssociationDto.phone,
        associationName: createAssociationDto.associationName,
        city: createAssociationDto.city,
        country: createAssociationDto.country,
        postalCode: createAssociationDto.postalCode,
        locationAssociation: createAssociationDto.locationAssociation,
        type: createAssociationDto.type,
        volunteers: [],
        volunteersWaiting: [],
      });
    } catch (error) {
      this.logger.error(
        `Erreur lors de la création de l'association: ${createAssociationDto.email}`,
        error.stack,
      );
      throw error instanceof BadRequestException || error instanceof NotFoundException
        ? error
        : new InternalServerErrorException("Erreur lors de la création de l'association");
    }
  }

  async findAll(): Promise<Association[]> {
    try {
      return await this.associationRepository.findAll();
    } catch (error) {
      this.logger.error('Erreur lors de la récupération des associations', error.stack);
      throw new InternalServerErrorException('Erreur lors de la récupération des associations');
    }
  }

  async findOne(id: string): Promise<Association | null> {
    try {
      const association = await this.associationRepository.findById(id);
      if (!association) {
        throw new NotFoundException('Association not found');
      }
      return association;
    } catch (error) {
      this.logger.error(`Erreur lors de la récupération de l'association: ${id}`, error.stack);
      throw error instanceof NotFoundException
        ? error
        : new InternalServerErrorException("Erreur lors de la récupération de l'association");
    }
  }

  async update(id: string, updateAssociationDto: UpdateAssociationDto) {
    try {
      const oldAssociation: Association = await this.associationRepository.findById(id);
      if (!oldAssociation) {
        throw new NotFoundException('Association not found');
      }
      if (
        updateAssociationDto.associationName &&
        oldAssociation.associationName !== updateAssociationDto.associationName
      ) {
        await this.announcementService.updateAnnouncementAssociationName(
          id,
          updateAssociationDto.associationName,
        );
      }
      await this.associationRepository.update(id, {
        ...updateAssociationDto,
      });
      return await this.associationRepository.findById(id);
    } catch (error) {
      this.logger.error(`Erreur lors de la mise à jour de l'association: ${id}`, error.stack);
      throw error instanceof NotFoundException
        ? error
        : new InternalServerErrorException("Erreur lors de la mise à jour de l'association");
    }
  }

  async remove(id: string) {
    try {
      const isExist: Association = await this.associationRepository.findById(id);
      if (!isExist) {
        throw new NotFoundException('Association not found');
      }
      await this.announcementService.deleteByAssociationId(id);
      await this.associationRepository.remove(id);
      return `This action removes a #${id} association`;
    } catch (error) {
      this.logger.error(`Erreur lors de la suppression de l'association: ${id}`, error.stack);
      throw error instanceof NotFoundException
        ? error
        : new InternalServerErrorException("Erreur lors de la suppression de l'association");
    }
  }

  async registerVolunteer(associationId: string, volunteer: VolunteerAssociationFollowing) {
    try {
      await this.removeVolunteerWaiting(associationId, volunteer.volunteerId);
      await this.addVolunteer(associationId, volunteer);
      return volunteer;
    } catch (error) {
      this.logger.error(`Erreur lors de l'inscription du bénévole: ${associationId}`, error.stack);
      throw new InternalServerErrorException("Erreur lors de l'inscription du bénévole");
    }
  }

  async addVolunteer(associationId: string, volunteerInfo: VolunteerAssociationFollowing) {
    try {
      const association: Association = await this.associationRepository.findById(associationId);
      if (!association) {
        throw new NotFoundException('Association not found');
      }
      const isExist = association.volunteers.find(
        volunteer => volunteer.volunteerId === volunteerInfo.volunteerId,
      );
      if (isExist) {
        throw new BadRequestException('Volunteer already exist');
      }
      association.volunteers.push({
        volunteerId: volunteerInfo.volunteerId,
        volunteerName: volunteerInfo.volunteerName,
      });
      await this.associationRepository.update(associationId, association);
      return volunteerInfo;
    } catch (error) {
      this.logger.error(`Erreur lors de l'ajout du bénévole: ${associationId}`, error.stack);
      throw error instanceof NotFoundException || error instanceof BadRequestException
        ? error
        : new InternalServerErrorException("Erreur lors de l'ajout du bénévole");
    }
  }

  async addVolunteerWaiting(associationId: string, volunteerInfo: VolunteerAssociationFollowing) {
    try {
      const association: Association = await this.associationRepository.findById(associationId);
      if (!association) {
        throw new NotFoundException('Association not found');
      }
      const isExist = association.volunteersWaiting.find(
        volunteer => volunteer.volunteerId === volunteerInfo.volunteerId,
      );
      if (isExist) {
        throw new BadRequestException('Volunteer already exist');
      }
      association.volunteersWaiting.push({
        volunteerId: volunteerInfo.volunteerId,
        volunteerName: volunteerInfo.volunteerName,
      });
      await this.associationRepository.update(associationId, association);
      return volunteerInfo;
    } catch (error) {
      this.logger.error(
        `Erreur lors de l'ajout du bénévole en attente: ${associationId}`,
        error.stack,
      );
      throw error instanceof NotFoundException || error instanceof BadRequestException
        ? error
        : new InternalServerErrorException("Erreur lors de l'ajout du bénévole en attente");
    }
  }

  async removeVolunteerWaiting(associationId: string, volunteerId: string) {
    try {
      const association: Association = await this.associationRepository.findById(associationId);
      if (!association) {
        throw new NotFoundException('Association not found');
      }
      const isExist = association.volunteersWaiting.find(
        volunteer => volunteer.volunteerId === volunteerId,
      );
      if (!isExist) {
        throw new BadRequestException('Volunteer not exist');
      }
      await this.associationRepository.removeVolunteerWaitingFromAssociation(
        associationId,
        volunteerId,
      );
      return volunteerId;
    } catch (error) {
      this.logger.error(
        `Erreur lors de la suppression du bénévole en attente: ${associationId}`,
        error.stack,
      );
      throw error instanceof NotFoundException || error instanceof BadRequestException
        ? error
        : new InternalServerErrorException('Erreur lors de la suppression du bénévole en attente');
    }
  }

  async removeVolunteer(associationId: string, volunteerId: string): Promise<string> {
    try {
      const association: Association = await this.associationRepository.findById(associationId);
      if (!association) {
        throw new NotFoundException('Association not found');
      }
      const isExist = association.volunteers.find(
        volunteer => volunteer.volunteerId === volunteerId,
      );
      if (!isExist) {
        throw new BadRequestException('Volunteer not exist');
      }
      return await this.associationRepository.removeVolunteerFromAssociation(
        associationId,
        volunteerId,
      );
    } catch (error) {
      this.logger.error(`Erreur lors de la suppression du bénévole: ${associationId}`, error.stack);
      throw error instanceof NotFoundException || error instanceof BadRequestException
        ? error
        : new InternalServerErrorException('Erreur lors de la suppression du bénévole');
    }
  }

  getAssociationWaitingByVolunteer(volunteerId: string): Promise<FindAssociationDto[]> {
    return this.associationRepository.findAssociationsByVolunteerWaiting(volunteerId);
  }

  getAssociationByVolunteer(volunteerId: string) {
    return this.associationRepository.findAssociationsByVolunteer(volunteerId);
  }

  async getVolunteersInWaitingList(
    associationId: string,
    volunteerId: string,
  ): Promise<VolunteerAssociationFollowing> {
    try {
      return await this.associationRepository.findVolunteersInWaitingList(
        associationId,
        volunteerId,
      );
    } catch (error) {
      this.logger.error(
        `Erreur lors de la récupération de la liste d'attente: ${associationId}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        "Erreur lors de la récupération de la liste d'attente",
      );
    }
  }

  async getAssociationsVolunteerList(associationId: string, volunteerId: string) {
    try {
      return await this.associationRepository.findVolunteersList(associationId, volunteerId);
    } catch (error) {
      this.logger.error(
        `Erreur lors de la récupération de la liste des bénévoles: ${associationId}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        'Erreur lors de la récupération de la liste des bénévoles',
      );
    }
  }

  async getAllAssociationsVolunteerFromWaitingList(volunteerId: string) {
    try {
      return await this.associationRepository.findAllAssociationsVolunteerFromWaitingList(
        volunteerId,
      );
    } catch (error) {
      this.logger.error(
        `Erreur lors de la récupération des associations du bénévole depuis la liste d'attente: ${volunteerId}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        "Erreur lors de la récupération des associations du bénévole depuis la liste d'attente",
      );
    }
  }

  async getAllAssociationsVolunteerFromList(volunteerId: string) {
    try {
      return await this.associationRepository.findAllAssociationsVolunteerFromList(volunteerId);
    } catch (error) {
      this.logger.error(
        `Erreur lors de la récupération des associations du bénévole: ${volunteerId}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        'Erreur lors de la récupération des associations du bénévole',
      );
    }
  }

  async removeVolunteerFollowingEverywhere(volunteerId: string): Promise<number> {
    try {
      return await this.associationRepository.removeVolunteerEverywhere(volunteerId);
    } catch (error) {
      this.logger.error(
        `Erreur lors de la suppression du bénévole partout: ${volunteerId}`,
        error.stack,
      );
      throw new InternalServerErrorException('Erreur lors de la suppression du bénévole partout');
    }
  }
}
