import { Injectable, Inject } from '@nestjs/common';
import { MongoClient } from 'mongodb';
import { MONGODB_CONNECTION } from '../../../database/mongodb.provider';
import { User } from '../entities/user.entity';
import { CreateUserDto } from '../dto/create-user.dto';
import { DatabaseCollection } from '../../../common/enums/database.collection';

@Injectable()
export class UserRepository {
  constructor(
    @Inject(MONGODB_CONNECTION)
    private readonly mongoClient: MongoClient,
  ) {}

  private get collection() {
    return this.mongoClient.db().collection<User>(DatabaseCollection.USERS);
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user: User = {
      userId: createUserDto._id,
      email: createUserDto.email,
      role: createUserDto.role,
      isOnline: false,
      disabled: createUserDto.disabled,
      isVerified: createUserDto.isVerified,
      lastConnection: createUserDto.lastSignInTime,
      isCompleted: createUserDto.isCompleted,
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
    return this.collection.findOne({ userId: id });
  }

  async findAll() {
    return this.collection.find().toArray();
  }

  async updateConnectionStatus(id: string, isOnline: boolean, lastSignInTime = ''): Promise<void> {
    await this.collection.updateOne(
      { userId: id },
      {
        $set: {
          isOnline: isOnline,
          lastConnection: lastSignInTime === '' ? new Date().toISOString() : lastSignInTime,
          updatedAt: new Date(),
        },
      },
    );
  }

  async updateIsComplete(id: string, isComplete: boolean): Promise<void> {
    await this.collection.updateOne(
      { userId: id },
      {
        $set: {
          isCompleted: isComplete,
          updatedAt: new Date(),
        },
      },
    );
  }

  async findAllOnlineUsers(): Promise<User[]> {
    return this.collection.find({ isOnline: true }).toArray();
  }

  async remove(id: string): Promise<void> {
    await this.collection.deleteOne({ userId: id });
  }

  async getUserImageProfileById(id: string): Promise<string | null> {
    const user = await this.collection.findOne({ userId: id }, { projection: { imageProfile: 1 } });
    return user?.imageProfile?.data || null;
  }

  async update(id: string, updateData: Partial<User>): Promise<void> {
    await this.collection.updateOne(
      { userId: id },
      {
        $set: {
          ...updateData,
          updatedAt: new Date(),
        },
      },
    );
  }
}
