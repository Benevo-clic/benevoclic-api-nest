import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VolunteerSettings } from '../entities/volunteer-settings.entity';
import { AssociationSettings } from '../entities/association-settings.entity';

@Injectable()
export class SettingsRepository {
  private readonly logger = new Logger(SettingsRepository.name);

  constructor(
    @InjectRepository(VolunteerSettings)
    private readonly volunteerRepository: Repository<VolunteerSettings>,
    @InjectRepository(AssociationSettings)
    private readonly associationRepository: Repository<AssociationSettings>,
  ) {}

  // ---------- VOLUNTEER ----------

  async findVolunteerSettingsByUserId(userId: string) {
    return this.volunteerRepository.findOneBy({ userId });
  }

  async createVolunteerSettings(settings: VolunteerSettings) {
    const created = this.volunteerRepository.create(settings);
    return await this.volunteerRepository.save(created);
  }

  async updateVolunteerSettings(userId: string, settings: Partial<VolunteerSettings>) {
    const res = await this.volunteerRepository.update({ userId }, settings);

    if (res.affected === 0) {
      throw new NotFoundException('Volunteer settings not found');
    }

    return await this.findVolunteerSettingsByUserId(userId);
  }

  async upsertVolunteerSettings(userId: string, settings: Partial<VolunteerSettings>) {
    const existing = await this.findVolunteerSettingsByUserId(userId);
    if (existing) {
      await this.volunteerRepository.update({ userId }, settings);
    } else {
      await this.volunteerRepository.save({ userId, ...settings });
    }
    return await this.findVolunteerSettingsByUserId(userId);
  }

  async deleteVolunteerSettings(userId: string) {
    const res = await this.volunteerRepository.delete({ userId });
    if (res.affected === 0) {
      throw new NotFoundException('Volunteer settings not found');
    }
    return res;
  }

  // ---------- ASSOCIATION ----------

  async findAssociationSettingsByAssociationId(associationId: string) {
    return this.associationRepository.findOneBy({ associationId });
  }

  async createAssociationSettings(settings: AssociationSettings) {
    const created = this.associationRepository.create(settings);
    return await this.associationRepository.save(created);
  }

  async updateAssociationSettings(associationId: string, settings: Partial<AssociationSettings>) {
    const res = await this.associationRepository.update({ associationId }, settings);

    if (res.affected === 0) {
      throw new NotFoundException('Association settings not found');
    }

    return await this.findAssociationSettingsByAssociationId(associationId);
  }

  async upsertAssociationSettings(associationId: string, settings: Partial<AssociationSettings>) {
    const existing = await this.findAssociationSettingsByAssociationId(associationId);
    if (existing) {
      await this.associationRepository.update({ associationId }, settings);
    } else {
      await this.associationRepository.save({ associationId, ...settings });
    }
    return await this.findAssociationSettingsByAssociationId(associationId);
  }

  async deleteAssociationSettings(associationId: string) {
    const res = await this.associationRepository.delete({ associationId });
    if (res.affected === 0) {
      throw new NotFoundException('Association settings not found');
    }
    return res;
  }
}
