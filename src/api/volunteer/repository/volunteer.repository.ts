import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Volunteer } from '../entities/volunteer.entity';

@Injectable()
export class VolunteerRepository {
  constructor(
    @InjectRepository(Volunteer)
    private readonly repository: Repository<Volunteer>,
  ) { }

  async findById(uid: string) {
    return await this.repository.findOneBy({ volunteerId: uid });
  }

  async create(volunteer: Volunteer) {
    const created = this.repository.create(volunteer);
    return this.repository.save(created);
  }

  async findAll() {
    return await this.repository.find();
  }

  async countAll(): Promise<number> {
    return await this.repository.count();
  }

  async remove(id: string) {
    const result = await this.repository.delete({ volunteerId: id });
    return { deletedCount: result.affected };
  }

  async update(id: string, volunteer: Partial<Volunteer>) {
    await this.repository.update({ volunteerId: id }, volunteer);
    return await this.findById(id);
  }
}
