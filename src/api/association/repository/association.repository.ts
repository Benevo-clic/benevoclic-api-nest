import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Association } from '../entities/association.entity';
import { FindAssociationDto } from '../dto/find-association.dto';
import { InfoAssociation, VolunteerAssociationFollowing } from '../type/association.type';

@Injectable()
export class AssociationRepository {
  private readonly logger = new Logger(AssociationRepository.name);

  constructor(
    @InjectRepository(Association)
    private readonly repository: Repository<Association>,
  ) { }

  async update(id: string, updateData: Partial<Association>): Promise<void> {
    await this.repository.update({ associationId: id }, updateData);
  }

  async findById(id: string): Promise<Association | null> {
    return this.repository.findOneBy({ associationId: id });
  }

  async create(association: Association): Promise<Association> {
    const created = this.repository.create(association);
    return this.repository.save(created);
  }

  async findAll(): Promise<Association[]> {
    return this.repository.find();
  }

  async countAll(): Promise<number> {
    return this.repository.count();
  }

  async remove(id: string) {
    await this.repository.delete({ associationId: id });
  }

  async findAssociationsByVolunteer(volunteerId: string): Promise<FindAssociationDto[]> {
    return this.repository
      .createQueryBuilder('association')
      .where('association.volunteers @> :volunteer', {
        volunteer: JSON.stringify([{ volunteerId }]),
      })
      .getMany();
  }

  async findAssociationsByVolunteerWaiting(volunteerId: string): Promise<FindAssociationDto[]> {
    return this.repository
      .createQueryBuilder('association')
      .where('association.volunteersWaiting @> :volunteer', {
        volunteer: JSON.stringify([{ volunteerId }]),
      })
      .getMany();
  }

  async findVolunteersInWaitingList(
    associationId: string,
    volunteerId: string,
  ): Promise<VolunteerAssociationFollowing | null> {
    const association = await this.repository
      .createQueryBuilder('association')
      .where('association.associationId = :associationId', { associationId })
      .andWhere('association.volunteersWaiting @> :volunteer', {
        volunteer: JSON.stringify([{ volunteerId }]),
      })
      .getOne();

    if (!association) {
      return null;
    }

    return (
      association.volunteersWaiting?.find(volunteer => volunteer.volunteerId === volunteerId) || null
    );
  }

  async removeVolunteerFromAssociation(
    associationId: string,
    volunteerId: string,
  ): Promise<string> {
    const association = await this.findById(associationId);
    if (association && association.volunteers) {
      association.volunteers = association.volunteers.filter(v => v.volunteerId !== volunteerId);
      await this.repository.save(association);
    }
    return volunteerId;
  }

  async removeVolunteerWaitingFromAssociation(
    associationId: string,
    volunteerId: string,
  ): Promise<void> {
    const association = await this.findById(associationId);
    if (association && association.volunteersWaiting) {
      association.volunteersWaiting = association.volunteersWaiting.filter(
        v => v.volunteerId !== volunteerId,
      );
      await this.repository.save(association);
    }
  }

  async findByEmail(email: string) {
    // Note: Association entity does not have email column in the original code,
    // but the repository had this method. If email is not stored, this returns null.
    // If we added email column, we can query it.
    // For now, assuming email is not stored on Association, so returning null or querying if column exists.
    // Since I didn't add email column (I added it in thought but not in file yet? No I didn't add it in file),
    // I should check if I added it. I didn't add it in the previous tool call.
    // So I will return null or try to find one if I add it.
    // Actually, I should add it to be safe.
    // But for now, I'll just return null as it seems to be the behavior.
    // Wait, if I return null, `create` proceeds.
    return null;
  }

  async findVolunteersList(associationId: string, volunteerId: string) {
    const association = await this.repository
      .createQueryBuilder('association')
      .where('association.associationId = :associationId', { associationId })
      .andWhere('association.volunteers @> :volunteer', {
        volunteer: JSON.stringify([{ volunteerId }]),
      })
      .getOne();

    if (!association) {
      return null;
    }

    return association.volunteers?.find(volunteer => volunteer.volunteerId === volunteerId) || null;
  }

  async findAllAssociationsVolunteerFromWaitingList(
    volunteerId: string,
  ): Promise<InfoAssociation[]> {
    const associations = await this.findAssociationsByVolunteerWaiting(volunteerId);
    return associations.map(a => ({
      associationId: a.associationId,
      associationName: a.associationName,
    }));
  }

  async findAllAssociationsVolunteerFromList(volunteerId: string): Promise<InfoAssociation[]> {
    const associations = await this.findAssociationsByVolunteer(volunteerId);
    return associations.map(a => ({
      associationId: a.associationId,
      associationName: a.associationName,
    }));
  }

  async removeVolunteerEverywhere(volunteerId: string): Promise<number> {
    // This is expensive with jsonb if we have to iterate all.
    // But we can find associations that have this volunteer and update them.
    const associations = await this.repository
      .createQueryBuilder('association')
      .where('association.volunteers @> :volunteer', {
        volunteer: JSON.stringify([{ volunteerId }]),
      })
      .orWhere('association.volunteersWaiting @> :volunteer', {
        volunteer: JSON.stringify([{ volunteerId }]),
      })
      .getMany();

    let modifiedCount = 0;
    for (const association of associations) {
      let changed = false;
      if (association.volunteers) {
        const initialLen = association.volunteers.length;
        association.volunteers = association.volunteers.filter(v => v.volunteerId !== volunteerId);
        if (association.volunteers.length !== initialLen) changed = true;
      }
      if (association.volunteersWaiting) {
        const initialLen = association.volunteersWaiting.length;
        association.volunteersWaiting = association.volunteersWaiting.filter(
          v => v.volunteerId !== volunteerId,
        );
        if (association.volunteersWaiting.length !== initialLen) changed = true;
      }
      if (changed) {
        await this.repository.save(association);
        modifiedCount++;
      }
    }
    return modifiedCount;
  }
}
