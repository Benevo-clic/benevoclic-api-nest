import { Injectable, Logger } from '@nestjs/common';
import { CreateAssociationDto } from '../dto/create-association.dto';
import { UpdateAssociationDto } from '../dto/update-association.dto';
import { Association } from '../entities/association.entity';
import { AssociationRepository } from '../repository/association.repository';
import { FirebaseAdminService } from '../../../common/firebase/firebaseAdmin.service';

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
      _id: firebaseUser.uid,
      bio: createAssociationDto.bio,
      associationName: createAssociationDto.associationName,
      city: createAssociationDto.city,
      country: createAssociationDto.country,
      postalCode: createAssociationDto.postalCode,
      type: createAssociationDto.type,
    });
  }

  async findAll() {
    return await this.associationRepository.findAll();
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

    return `This action updates a #${id} association`;
  }

  async remove(id: string) {
    const isExist: Association = await this.associationRepository.findById(id);
    if (!isExist) {
      throw new Error('Association not found');
    }

    await this.associationRepository.remove(id);

    return `This action removes a #${id} association`;
  }
}
