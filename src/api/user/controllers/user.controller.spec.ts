import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from '../../../common/services/user/user.service';
import { UserRole } from '../../../common/enums/roles.enum';
import { InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import * as mockData from '../../../../test/testFiles/user.data.json';
import { ConfigService } from '@nestjs/config';

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
  let userService: UserService;

  const mockUserService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    registerUser: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    logout: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('mock-api-key'),
          },
        },
      ],
    }).compile();

    userController = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(userController).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      mockUserService.findAll.mockResolvedValue(mockData.users);
      const users = await userController.findAll();
      expect(users).toBeDefined();
      expect(Array.isArray(users)).toBe(true);
    });
  });

  describe('findOne', () => {
    it('should return a single user', async () => {
      mockUserService.findOne.mockResolvedValue(mockData.users[0]);
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
      mockUserService.registerUser.mockResolvedValue({ uid: 'newMockUid123', ...newUser });
      const createdUser = await userController.registerUser(newUser);
      expect(createdUser).toBeDefined();
    });

    it('should throw an error if email already exists', async () => {
      const existingUser = {
        ...newUser,
        email: 'existing@email.com',
      };

      mockUserService.registerUser.mockRejectedValue(new InternalServerErrorException());

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
      mockUserService.update.mockResolvedValue({ message: 'Utilisateur mis à jour avec succès' });

      const result = await userController.update(mockData.users[0].userId, updateData);
      expect(result).toBeDefined();
      expect(result).toEqual({ message: 'Utilisateur mis à jour avec succès' });
    });

    it('should throw error if user not found', async () => {
      mockUserService.update.mockRejectedValue(
        new NotFoundException("Erreur lors de la mise à jour de l'utilisateur"),
      );

      await expect(userController.update('nonexistent-id', updateData)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('delete', () => {
    it('should delete a user', async () => {
      const userId = mockData.users[0].userId;
      mockUserService.remove.mockResolvedValue({ uid: userId });

      const result = await userController.remove(userId);
      expect(result).toEqual({ uid: userId });
    });

    it('should throw error if user not found', async () => {
      mockUserService.remove.mockRejectedValue(
        new NotFoundException("Erreur lors de la suppression de l'utilisateur"),
      );
      await expect(userController.remove('nonexistent-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('logout', () => {
    it('should logout a user', async () => {
      const req = { user: { uid: 'mockUid123' } };
      mockUserService.logout.mockResolvedValue({ message: 'Déconnexion réussie' });

      const result = await userController.logout(req);
      expect(result).toEqual({ message: 'Déconnexion réussie' });
    });

    it('should throw error if user not found', async () => {
      const req = { user: { uid: 'nonexistent-id' } };
      mockUserService.logout.mockRejectedValue(new NotFoundException('Erreur lors de la déconnexion'));
      await expect(userController.logout(req)).rejects.toThrow(NotFoundException);
    });
  });
});

jest.spyOn(Logger.prototype, 'error').mockImplementation(() => { });
