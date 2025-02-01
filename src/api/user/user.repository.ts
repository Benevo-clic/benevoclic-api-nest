import { Injectable, Inject } from '@nestjs/common';
import { MongoClient } from 'mongodb';
import { MONGODB_CONNECTION } from '../../database/mongodb.provider';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UserRepository {
  constructor(
    @Inject(MONGODB_CONNECTION)
    private readonly mongoClient: MongoClient,
  ) {}

  private get collection() {
    return this.mongoClient.db().collection<User>('users');
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user: User = {
      _id: createUserDto._id,
      email: createUserDto.email,
      firstName: createUserDto.firstName,
      lastName: createUserDto.lastName,
      phoneNumber: createUserDto.phoneNumber,
      role: createUserDto.role,
      isOnline: false,
      disabled: createUserDto.disabled,
      lastConnection: createUserDto.lastSignInTime,
      createdAt: createUserDto.createdAt,
      updatedAt: new Date(),
    };
    await this.collection.insertOne(user);
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.collection.findOne({ email });
  }

  async findByUid(id: string): Promise<User | null> {
    return this.collection.findOne({ _id: id });
  }

  async updateConnectionStatus(id: string, isOnline: boolean, lastSignInTime = ''): Promise<void> {
    await this.collection.updateOne(
      { _id: id },
      {
        $set: {
          isOnline,
          lastConnection: lastSignInTime,
          updatedAt: new Date(),
        },
      },
    );
  }

  async findAllOnlineUsers(): Promise<User[]> {
    return this.collection.find({ isOnline: true }).toArray();
  }

  async updateUserProfile(uid: string, profileData: Partial<User>): Promise<void> {
    await this.collection.updateOne(
      { uid },
      {
        $set: {
          ...profileData,
          updatedAt: new Date(),
        },
      },
    );
  }

  async remove(id: string): Promise<void> {
    await this.collection.deleteOne({ _id: id });
  }

  async update(id: string, updateData: Partial<User>): Promise<void> {
    await this.collection.updateOne(
      { _id: id },
      {
        $set: {
          ...updateData,
          updatedAt: new Date(),
        },
      },
    );
  }
}
