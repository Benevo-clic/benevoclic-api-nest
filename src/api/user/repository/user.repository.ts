import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { CreateUserDto } from '../dto/create-user.dto';

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = this.repository.create({
      userId: createUserDto._id,
      email: createUserDto.email,
      role: createUserDto.role,
      isOnline: false,
      disabled: createUserDto.disabled,
      isVerified: createUserDto.isVerified,
      lastConnection: createUserDto.lastSignInTime,
      avatarFileKey: '',
      isCompleted: createUserDto.isCompleted,
      createdAt: createUserDto.createdAt,
      updatedAt: new Date(),
    });
    return this.repository.save(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.repository.findOneBy({ email });
  }

  async findByUid(id: string): Promise<User | null> {
    return this.repository.findOneBy({ userId: id });
  }

  async findAll() {
    return this.repository.find();
  }

  async updateConnectionStatus(id: string, isOnline: boolean, lastSignInTime = ''): Promise<void> {
    await this.repository.update(
      { userId: id },
      {
        isOnline: isOnline,
        lastConnection: lastSignInTime === '' ? new Date().toISOString() : lastSignInTime,
        updatedAt: new Date(),
      },
    );
  }

  async updateIsComplete(id: string, isComplete: boolean): Promise<void> {
    await this.repository.update(
      { userId: id },
      {
        isCompleted: isComplete,
        updatedAt: new Date(),
      },
    );
  }

  async findAllOnlineUsers(): Promise<User[]> {
    return this.repository.findBy({ isOnline: true });
  }

  async remove(id: string): Promise<void> {
    await this.repository.delete({ userId: id });
  }

  async getUserImageProfileById(id: string): Promise<string | null> {
    const user = await this.repository.findOne({
      where: { userId: id },
      select: ['imageProfile'],
    });
    return user?.imageProfile?.data || null;
  }

  async update(id: string, updateData: Partial<User>): Promise<void> {
    await this.repository.update(
      { userId: id },
      {
        ...updateData,
        updatedAt: new Date(),
      },
    );
  }
}
