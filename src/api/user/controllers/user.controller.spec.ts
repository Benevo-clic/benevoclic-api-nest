import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from '../../../common/services/user/user.service';
import { UserRepository } from '../repository/user.repository';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { DatabaseModule } from '../../../database/database.module';
import { MONGODB_CONNECTION } from '../../../database/mongodb.provider';
import { MongoClient, ObjectId } from 'mongodb';
import { DatabaseCollection } from '../../../common/enums/database.collection';
import { UserRole } from '../../../common/enums/roles.enum';
import { InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import * as admin from 'firebase-admin';
import * as mockData from '../../../../test/testFiles/user.data.json';
import { VolunteerService } from '../../volunteer/services/volunteer.service';
import { AssociationService } from '../../association/services/association.service';
import { AwsS3Service } from '../../../common/aws/aws-s3.service';
import { SettingsService } from '../../settings/services/settings.service';

jest.mock('firebase-admin', () => ({
  initializeApp: jest.fn(),
  credential: {
    cert: jest.fn(),
  },
  auth: () => ({
    createUser: jest.fn().mockResolvedValue({
      uid: 'mockUid123',
      email: 'volunteer@yahoo.com',
    }),
    getUserByEmail: jest.fn().mockResolvedValue({
      uid: 'mockUid123',
      email: 'volunteer@yahoo.com',
    }),
  }),
}));

jest.mock('../../../config/auth.config', () => ({
  AuthConfig: {
    apiKey: 'mock-api-key',
  },
}));

jest.mock('../../../common/firebase/firebaseAdmin.service', () => ({
  FirebaseAdminService: {
    getInstance: jest.fn().mockReturnValue({
      getUserByEmail: jest.fn().mockImplementation(email => {
        if (email === 'existing@email.com') {
          return Promise.resolve({ uid: 'existingUid' });
        }
        return Promise.resolve(null);
      }),
      createUser: jest.fn().mockResolvedValue({
        uid: 'newMockUid123',
        email: 'volunteer@yahoo.com',
        metadata: {
          lastSignInTime: new Date().toISOString(),
          creationTime: new Date().toISOString(),
          lastRefreshTime: new Date().toISOString(),
        },
        disabled: false,
        emailVerified: false,
      }),
      updateUser: jest.fn().mockResolvedValue({
        uid: 'mockUid123',
        email: 'updated@email.com',
        emailVerified: false,
        disabled: false,
        metadata: {
          lastSignInTime: new Date().toISOString(),
          creationTime: new Date().toISOString(),
          toJSON: () => ({}),
        },
        providerData: [],
        toJSON: () => ({}),
      }),
      setCustomUserClaims: jest.fn().mockResolvedValue(undefined),
      auth: jest.fn().mockReturnValue({
        setCustomUserClaims: jest.fn().mockResolvedValue(undefined),
      }),
      deleteUser: jest.fn().mockImplementation(uid => {
        if (uid === 'nonexistent-id') {
          return Promise.reject(new Error('User not found'));
        }
        return Promise.resolve();
      }),
    }),
  },
}));

describe('UserController', () => {
  let userController: UserController;
  let mongoClient: MongoClient;
  let testingModule: TestingModule;
  let userService: UserService;

  beforeAll(async () => {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: 'mock-project',
        clientEmail: 'mock@email.com',
        privateKey: 'mock-key',
      }),
    });

    testingModule = await Test.createTestingModule({
      imports: [
        NestConfigModule.forRoot({
          isGlobal: true,
          load: [
            () => ({
              FIREBASE_API_KEY: 'mock-api-key',
              MONGODB_URL: process.env.MONGODB_URL,
              MONGODB_DB_NAME: process.env.MONGODB_DB_NAME,
            }),
          ],
        }),
        DatabaseModule,
      ],
      controllers: [UserController],
      providers: [
        UserService,
        UserRepository,
        {
          provide: VolunteerService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findById: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
        {
          provide: AssociationService,
          useValue: {
            findAll: jest.fn(),
            findById: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
        {
          provide: AwsS3Service,
          useValue: {
            uploadFile: jest.fn(),
            deleteFile: jest.fn(),
            getFileUrl: jest.fn(),
          },
        },
        {
          provide: SettingsService,
          useValue: {
            findAll: jest.fn(),
            findById: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
            findByKey: jest.fn(),
            updateByKey: jest.fn(),
          },
        },
      ],
      exports: [UserService],
    }).compile();

    userController = testingModule.get<UserController>(UserController);
    mongoClient = testingModule.get<MongoClient>(MONGODB_CONNECTION);
    userService = testingModule.get<UserService>(UserService);

    if (mongoClient) {
      const users = mockData.users.map(user => ({
        ...user,
        _id: new ObjectId(),
      }));
      const db = mongoClient.db();
      await db.collection(DatabaseCollection.USERS).deleteMany({});
      await db.collection(DatabaseCollection.USERS).insertMany(users);
    }
  });

  afterAll(async () => {
    if (mongoClient) {
      const db = mongoClient.db();
      await db.collection(DatabaseCollection.USERS).deleteMany({});
    }
    if (testingModule) {
      await testingModule.close();
    }
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      const users = await userController.findAll();
      expect(users).toBeDefined();
      expect(Array.isArray(users)).toBe(true);
    });
  });

  describe('findOne', () => {
    it('should return a single user', async () => {
      const found = await userController.findOne(mockData.users[0].userId);

      expect(found).toBeDefined();
      expect(found).not.toBeNull();
      expect(found.email).toBe(mockData.users[0].email);
    });
  });

  describe('create', () => {
    const newUser = {
      email: 'volunteer@yahoo.com',
      firstName: 'Volunteer',
      lastName: 'Volunteer',
      phoneNumber: '1234567890',
      password: 'password',
      role: UserRole.VOLUNTEER,
    };

    it('should create a new user', async () => {
      const createdUser = await userController.registerUser(newUser);
      expect(createdUser).toBeDefined();
    });

    it('should throw an error if email already exists', async () => {
      const existingUser = {
        ...newUser,
        email: 'existing@email.com',
      };

      await expect(userController.registerUser(existingUser)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('update', () => {
    const updateData = {
      email: 'volunteer@yahoo.com',
      firstName: 'Volunteer',
      lastName: 'Volunteer',
      phoneNumber: '1234567890',
      role: UserRole.VOLUNTEER,
    };

    it('should update a user', async () => {
      jest
        .spyOn(userService, 'update')
        .mockResolvedValue({ message: 'Utilisateur mis à jour avec succès' });

      const result = await userController.update(mockData.users[0].userId, updateData);
      expect(result).toBeDefined();
      expect(result).toEqual({ message: 'Utilisateur mis à jour avec succès' });
    });

    it('should throw error if user not found', async () => {
      jest
        .spyOn(userService, 'update')
        .mockRejectedValue(new NotFoundException("Erreur lors de la mise à jour de l'utilisateur"));

      await expect(userController.update('nonexistent-id', updateData)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('delete', () => {
    it('should delete a user', async () => {
      const userId = mockData.users[0].userId;
      jest.spyOn(userService, 'remove').mockResolvedValue({ uid: userId });

      const result = await userController.remove(userId);
      expect(result).toEqual({ uid: userId });
    });

    it('should throw error if user not found', async () => {
      jest
        .spyOn(userService, 'remove')
        .mockRejectedValue(new NotFoundException("Erreur lors de la suppression de l'utilisateur"));
      await expect(userController.remove('nonexistent-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('logout', () => {
    it('should logout a user', async () => {
      const req = { user: { uid: 'mockUid123' } };
      jest.spyOn(userService, 'logout').mockResolvedValue({ message: 'Déconnexion réussie' });

      const result = await userController.logout(req);
      expect(result).toEqual({ message: 'Déconnexion réussie' });
    });

    it('should throw error if user not found', async () => {
      const req = { user: { uid: 'nonexistent-id' } };
      jest
        .spyOn(userService, 'logout')
        .mockRejectedValue(new NotFoundException('Erreur lors de la déconnexion'));
      await expect(userController.logout(req)).rejects.toThrow(NotFoundException);
    });
  });
});

jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
