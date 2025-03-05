import { Injectable, Logger } from '@nestjs/common';
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
    const firebaseUser = await this.firebaseInstance.getUserByEmail(createVolunteerDto.email);
    if (!firebaseUser) {
      throw new Error('Email not found');
    }
    const isExist = await this.volunteerRepository.findById(firebaseUser.uid);
    if (isExist) throw new Error('Email already exist');
    this.logger.log(`Volunteer created: ${firebaseUser.uid}`);
    return this.volunteerRepository.create({
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
  }

  findAll() {
    return this.volunteerRepository.findAll();
  }

  async findOne(id: string) {
    return this.volunteerRepository.findById(id);
  }

  async update(id: string, updateVolunteerDto: UpdateVolunteerDto) {
    const isExist = await this.volunteerRepository.findById(id);
    if (!isExist) throw new Error('Volunteer not found');

    await this.volunteerRepository.update(id, {
      ...updateVolunteerDto,
    });
    this.logger.log(`Volunteer updated: ${id}`);
    return await this.volunteerRepository.findById(id);
  }

  async remove(id: string) {
    const isExist = await this.volunteerRepository.findById(id);
    if (!isExist) throw new Error('Volunteer not found');
    const deleteResult = await this.volunteerRepository.remove(id);
    if (!deleteResult.deletedCount) throw new Error('Volunteer not found');
    this.logger.log(`Volunteer deleted: ${id}`);
    return { volunteerId: id };
  }
}
