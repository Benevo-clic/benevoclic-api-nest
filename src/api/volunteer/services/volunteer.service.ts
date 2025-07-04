import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateVolunteerDto } from '../dto/create-volunteer.dto';
import { UpdateVolunteerDto } from '../dto/update-volunteer.dto';
import { FirebaseAdminService } from '../../../common/firebase/firebaseAdmin.service';
import { VolunteerRepository } from '../repository/volunteer.repository';

@Injectable()
export class VolunteerService {
  private readonly logger = new Logger(VolunteerService.name);
  firebaseInstance: FirebaseAdminService = FirebaseAdminService.getInstance();

  constructor(private readonly volunteerRepository: VolunteerRepository) {}

  async create(createVolunteerDto: CreateVolunteerDto) {
    try {
      const firebaseUser = await this.firebaseInstance.getUserByEmail(createVolunteerDto.email);
      if (!firebaseUser) {
        this.logger.error(`Email not found: ${createVolunteerDto.email}`);
        throw new NotFoundException('Email not found');
      }
      const isExist = await this.volunteerRepository.findById(firebaseUser.uid);
      if (isExist) {
        this.logger.error(`Email already exist: ${createVolunteerDto.email}`);
        throw new BadRequestException('Email already exist');
      }
      this.logger.log(`Volunteer created: ${firebaseUser.uid}`);
      return await this.volunteerRepository.create({
        volunteerId: firebaseUser.uid,
        city: createVolunteerDto.city,
        country: createVolunteerDto.country,
        firstName: createVolunteerDto.firstName,
        lastName: createVolunteerDto.lastName,
        phone: createVolunteerDto.phone,
        postalCode: createVolunteerDto.postalCode,
        birthDate: createVolunteerDto.birthDate,
        bio: createVolunteerDto.bio,
        myAssociations: [],
        myAssociationsWaiting: [],
      });
    } catch (error) {
      this.logger.error('Erreur lors de la création du bénévole', error.stack);
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Erreur lors de la création du bénévole');
    }
  }

  async findAll() {
    try {
      return await this.volunteerRepository.findAll();
    } catch (error) {
      this.logger.error('Erreur lors de la récupération des bénévoles', error.stack);
      throw new InternalServerErrorException('Erreur lors de la récupération des bénévoles');
    }
  }

  async findOne(id: string) {
    try {
      const volunteer = await this.volunteerRepository.findById(id);
      if (!volunteer) {
        this.logger.error(`Volunteer not found: ${id}`);
        return null;
      }
      return volunteer;
    } catch (error) {
      this.logger.error('Erreur lors de la récupération du bénévole', error.stack);
      throw new InternalServerErrorException('Erreur lors de la récupération du bénévole');
    }
  }

  async update(id: string, updateVolunteerDto: UpdateVolunteerDto) {
    try {
      const isExist = await this.volunteerRepository.findById(id);
      if (!isExist) {
        this.logger.error(`Volunteer not found: ${id}`);
        throw new NotFoundException('Volunteer not found');
      }
      await this.volunteerRepository.update(id, {
        ...updateVolunteerDto,
      });
      this.logger.log(`Volunteer updated: ${id}`);
      return await this.volunteerRepository.findById(id);
    } catch (error) {
      this.logger.error('Erreur lors de la mise à jour du bénévole', error.stack);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Erreur lors de la mise à jour du bénévole');
    }
  }

  async remove(id: string) {
    try {
      const isExist = await this.volunteerRepository.findById(id);
      if (!isExist) {
        this.logger.error(`Volunteer not found: ${id}`);
        throw new NotFoundException('Volunteer not found');
      }
      const deleteResult = await this.volunteerRepository.remove(id);
      if (!deleteResult.deletedCount) {
        this.logger.error(`Volunteer not found (delete): ${id}`);
        throw new NotFoundException('Volunteer not found');
      }
      this.logger.log(`Volunteer deleted: ${id}`);
      return { volunteerId: id };
    } catch (error) {
      this.logger.error('Erreur lors de la suppression du bénévole', error.stack);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Erreur lors de la suppression du bénévole');
    }
  }
}
