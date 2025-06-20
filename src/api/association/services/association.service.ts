import { Injectable } from '@nestjs/common';
import { CreateAssociationDto } from '../dto/create-association.dto';
import { UpdateAssociationDto } from '../dto/update-association.dto';
import { Association } from '../entities/association.entity';
import { AssociationRepository } from '../repository/association.repository';
import { FirebaseAdminService } from '../../../common/firebase/firebaseAdmin.service';
import { InfoVolunteer } from '../type/association.type';
import { FindAssociationDto } from '../dto/find-association.dto';

@Injectable()
export class AssociationService {
  firebaseInstance: FirebaseAdminService = FirebaseAdminService.getInstance();

  constructor(private readonly associationRepository: AssociationRepository) {}

  async create(createAssociationDto: CreateAssociationDto) {
    const firebaseUser = await this.firebaseInstance.getUserByEmail(createAssociationDto.email);
    if (!firebaseUser) {
      throw new Error('Email not found');
    }

    const isExist: Association = await this.associationRepository.findById(firebaseUser.uid);

    if (isExist) {
      throw new Error('Email already exist');
    }

    const emailExist = await this.associationRepository.findByEmail(createAssociationDto.email);
    if (emailExist) {
      throw new Error('Email already exist');
    }

    return this.associationRepository.create({
      associationId: firebaseUser.uid,
      bio: createAssociationDto.bio,
      associationName: createAssociationDto.associationName,
      city: createAssociationDto.city,
      country: createAssociationDto.country,
      postalCode: createAssociationDto.postalCode,
      type: createAssociationDto.type,
      volunteers: [],
      volunteersWaiting: [],
    });
  }

  async findAll(): Promise<Association[]> {
    return this.associationRepository.findAll();
  }

  async findOne(id: string): Promise<Association | null> {
    return this.associationRepository.findById(id);
  }

  async update(id: string, updateAssociationDto: UpdateAssociationDto) {
    const oldAssociation: Association = await this.associationRepository.findById(id);
    if (!oldAssociation) {
      throw new Error('Association not found');
    }

    await this.associationRepository.update(id, {
      ...updateAssociationDto,
    });

    return await this.associationRepository.findById(id);
  }

  async remove(id: string) {
    const isExist: Association = await this.associationRepository.findById(id);
    if (!isExist) {
      throw new Error('Association not found');
    }

    await this.associationRepository.remove(id);

    return `This action removes a #${id} association`;
  }

  async registerVolunteer(associationId: string, volunteer: InfoVolunteer) {
    await this.removeVolunteerWaiting(associationId, volunteer.id);
    await this.addVolunteer(associationId, volunteer);
    return volunteer;
  }

  async addVolunteer(associationId: string, volunteerInfo: InfoVolunteer) {
    const association: Association = await this.associationRepository.findById(associationId);
    if (!association) {
      throw new Error('Association not found');
    }

    const isExist = await this.associationRepository.findAssociationsByVolunteer(volunteerInfo.id);
    if (isExist.length > 0) {
      throw new Error('Volunteer already exist');
    }

    association.volunteers.push(volunteerInfo);
    await this.associationRepository.update(associationId, association);

    return volunteerInfo;
  }

  async addVolunteerWaiting(associationId: string, volunteerInfo: InfoVolunteer) {
    const association: Association = await this.associationRepository.findById(associationId);
    if (!association) {
      throw new Error('Association not found');
    }

    const isExist = await this.associationRepository.findAssociationsByVolunteerWaiting(
      volunteerInfo.id,
    );
    if (isExist.length > 0) {
      throw new Error('Volunteer already exist');
    }

    association.volunteersWaiting.push(volunteerInfo);
    await this.associationRepository.update(associationId, association);
    return volunteerInfo;
  }

  async removeVolunteerWaiting(associationId: string, volunteerId: string) {
    const association: Association = await this.associationRepository.findById(associationId);
    if (!association) {
      throw new Error('Association not found');
    }

    const isExist: FindAssociationDto[] =
      await this.associationRepository.findAssociationsByVolunteerWaiting(volunteerId);
    if (isExist.length === 0) {
      throw new Error('Volunteer not exist');
    }

    await this.associationRepository.removeVolunteerWaitingFromAssociation(
      associationId,
      volunteerId,
    );
    return volunteerId;
  }

  async removeVolunteer(associationId: string, volunteerId: string): Promise<string> {
    const association: Association = await this.associationRepository.findById(associationId);
    if (!association) {
      throw new Error('Association not found');
    }

    const isExist = await this.associationRepository.findAssociationsByVolunteer(volunteerId);
    if (isExist.length === 0) {
      throw new Error('Volunteer not exist');
    }

    return await this.associationRepository.removeVolunteerFromAssociation(
      associationId,
      volunteerId,
    );
  }

  getAssociationWaitingByVolunteer(volunteerId: string): Promise<FindAssociationDto[]> {
    return this.associationRepository.findAssociationsByVolunteerWaiting(volunteerId);
  }

  getAssociationByVolunteer(volunteerId: string) {
    return this.associationRepository.findAssociationsByVolunteer(volunteerId);
  }
}
