import { Injectable, Logger } from '@nestjs/common';
import { CreateAssociationDto } from '../dto/create-association.dto';
import { UpdateAssociationDto } from '../dto/update-association.dto';
import { Association } from '../entities/association.entity';
import { AssociationRepository } from '../repository/association.repository';
import { FirebaseAdminService } from '../../../common/firebase/firebaseAdmin.service';
import { InfoVolunteer } from '../type/association.type';

@Injectable()
export class AssociationService {
  private readonly logger = new Logger(AssociationService.name);
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
      bio: updateAssociationDto.bio ?? oldAssociation.bio,
      associationName: updateAssociationDto.associationName ?? oldAssociation.associationName,
      city: updateAssociationDto.city ?? oldAssociation.city,
      country: updateAssociationDto.country ?? oldAssociation.country,
      postalCode: updateAssociationDto.postalCode ?? oldAssociation.postalCode,
      type: updateAssociationDto.type ?? oldAssociation.type,
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

  async addVolunteer(associationId: string, volunteerInfo: InfoVolunteer) {
    const association: Association = await this.associationRepository.findById(associationId);
    if (!association) {
      throw new Error('Association not found');
    }

    const isExist = await this.associationRepository.findAssociationsByVolunteer(volunteerInfo.id);
    if (isExist.length > 0) {
      throw new Error('Volunteer already exist');
    }
    await this.removeVolunteerWaiting(associationId, volunteerInfo.id);

    association.volunteers.push(volunteerInfo);
    await this.associationRepository.update(associationId, association);

    return `This action adds a volunteer to association #${associationId}`;
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
  }

  async removeVolunteerWaiting(associationId: string, volunteerId: string) {
    const association: Association = await this.associationRepository.findById(associationId);
    if (!association) {
      throw new Error('Association not found');
    }

    const isExist: Association[] =
      await this.associationRepository.findAssociationsByVolunteerWaiting(volunteerId);
    if (isExist.length === 0) {
      throw new Error('Volunteer not exist');
    }

    await this.associationRepository.removeVolunteerWaitingFromAssociation(
      associationId,
      volunteerId,
    );
  }

  async removeVolunteer(associationId: string, volunteerId: string) {
    const association: Association = await this.associationRepository.findById(associationId);
    if (!association) {
      throw new Error('Association not found');
    }

    const isExist = await this.associationRepository.findAssociationsByVolunteer(volunteerId);
    if (isExist.length === 0) {
      throw new Error('Volunteer not exist');
    }

    await this.associationRepository.removeVolunteerFromAssociation(associationId, volunteerId);
  }
}
