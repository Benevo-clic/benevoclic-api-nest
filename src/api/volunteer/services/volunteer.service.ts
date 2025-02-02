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

    return this.volunteerRepository.create({
      _id: firebaseUser.uid,
      city: createVolunteerDto.city,
      country: createVolunteerDto.country,
      postalCode: createVolunteerDto.postalCode,
      birthDate: createVolunteerDto.birthDate,
      bio: createVolunteerDto.bio,
      myAssociations: [],
      myAssociationsWaiting: [],
    });
  }

  findAll() {
    return `This action returns all volunteer`;
  }

  async findOne(id: string) {
    return this.volunteerRepository.findById(id);
  }

  async update(id: string, updateVolunteerDto: UpdateVolunteerDto) {
    const firebaseUser = await this.firebaseInstance.getUser(id);
    const oldVolunteer = await this.volunteerRepository.findById(id);
    await this.volunteerRepository.update(id, {
      _id: firebaseUser.uid,
      city: updateVolunteerDto.city ?? oldVolunteer.city,
      country: updateVolunteerDto.country ?? oldVolunteer.country,
      postalCode: updateVolunteerDto.postalCode ?? oldVolunteer.postalCode,
      birthDate: updateVolunteerDto.birthDate ?? oldVolunteer.birthDate,
      bio: updateVolunteerDto.bio ?? oldVolunteer.bio,
    });

    return `This action updates a #${id} volunteer`;
  }

  async remove(id: string) {
    const isExist = this.volunteerRepository.findById(id);
    if (!isExist) throw new Error('Volunteer not found');
    await this.volunteerRepository.remove(id);
    return `This action removes a #${id} volunteer`;
  }
}
