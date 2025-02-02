import { Injectable, Logger } from '@nestjs/common';
import { CreateAssociationDto } from './dto/create-association.dto';
import { UpdateAssociationDto } from './dto/update-association.dto';
import { Association } from './entities/association.entity';
import { AssociationRepository } from './association.repository';
import { Location, ProfileImage } from './type/association.type';
import { FirebaseAdminService } from '../../common/firebase/firebaseAdmin.service';

@Injectable()
export class AssociationService {
  private readonly logger = new Logger(AssociationService.name);
  firebaseInstance: FirebaseAdminService = FirebaseAdminService.getInstance();

  constructor(private readonly associationRepository: AssociationRepository) {}

  async create(createAssociationDto: CreateAssociationDto) {
    const firebaseUser = await this.firebaseInstance.getUserByEmail(createAssociationDto.email);

    const isExist: Association = await this.associationRepository.findByEmail(firebaseUser.email);

    if (isExist) {
      throw new Error('Email already exist');
    }
    const association: Association = {
      _id: firebaseUser.uid,
      bio: createAssociationDto.bio,
      associationName: createAssociationDto.associationName,
      city: createAssociationDto.city,
      country: createAssociationDto.country,
      postalCode: createAssociationDto.postalCode,
      type: createAssociationDto.type,
    };

    return this.associationRepository.create(association);
  }

  async findAll() {
    return await this.associationRepository.findAll();
  }

  async findOne(id: string): Promise<Association | null> {
    return this.associationRepository.findById(id);
  }

  async update(id: string, updateAssociationDto: UpdateAssociationDto) {
    const firebaseUser = await this.firebaseInstance.getUser(id);
    const oldAssociation: Association = await this.associationRepository.findById(id);
    const association: Association = {
      _id: firebaseUser.uid,
      bio: updateAssociationDto.bio ?? oldAssociation.bio,
      associationName: updateAssociationDto.associationName ?? oldAssociation.associationName,
      city: updateAssociationDto.city ?? oldAssociation.city,
      country: updateAssociationDto.country ?? oldAssociation.country,
      postalCode: updateAssociationDto.postalCode ?? oldAssociation.postalCode,
      type: updateAssociationDto.type ?? oldAssociation.type,
      location: oldAssociation.location,
      profileImage: oldAssociation.profileImage,
      volunteers: oldAssociation.volunteers,
      volunteersWaiting: oldAssociation.volunteersWaiting,
    };

    await this.associationRepository.update(id, association);

    return `This action updates a #${id} association`;
  }

  remove(id: number) {
    return `This action removes a #${id} association`;
  }

  async updateProfileImage(id: string, profileImage: ProfileImage): Promise<void> {
    await this.associationRepository.update(id, { profileImage });
  }

  async updateLocation(id: string, location: Location): Promise<void> {
    await this.associationRepository.updateLocation(id, location);
  }
}
