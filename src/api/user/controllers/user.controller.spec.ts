import { UserController } from './user.controller';
import { ObjectId } from 'mongodb';
import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from '../services/user.service';
import * as mockData from '../../../../test/testFiles/user.data.json';
import { UserRole } from '../../../common/enums/roles.enum';
import { Response } from 'express';
import { User } from '../entities/user.entity';
import { UserRecord, UserMetadata } from 'firebase-admin/auth';
import { WithId } from 'mongodb';

// Mock Firebase Admin
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

// Mock AuthConfig
jest.mock('../../../config/auth.config', () => ({
  AuthConfig: {
    apiKey: 'mock-api-key',
  },
}));

// Mock FirebaseAdminService
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

  // Mock de Response pour Express
  const mockResponse = {
    cookie: jest.fn(),
    clearCookie: jest.fn(),
  } as unknown as Response;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: {
            registerUser: jest.fn(),
            loginUser: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
            logout: jest.fn(),
            findByRole: jest.fn(),
            refreshAuthToken: jest.fn(),
            updateProfilePicture: jest.fn(),
            updateLocation: jest.fn(),
            getProfileImage: jest.fn(),
          },
        },
      ],
    }).compile();

    userController = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      const mockUsers: WithId<User>[] = [
        {
          _id: new ObjectId('507f1f77bcf86cd799439011'),
          userId: '1',
          email: 'user1@test.com',
          firstName: 'User',
          lastName: 'One',
          phoneNumber: '1234567890',
          role: UserRole.VOLUNTEER,
          isVerified: true,
          disabled: false,
          isOnline: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          lastConnection: new Date().toISOString(),
        },
        {
          _id: new ObjectId('507f1f77bcf86cd799439012'),
          userId: '2',
          email: 'user2@test.com',
          firstName: 'User',
          lastName: 'Two',
          phoneNumber: '0987654321',
          role: UserRole.VOLUNTEER,
          isVerified: true,
          disabled: false,
          isOnline: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          lastConnection: new Date().toISOString(),
        },
      ];

      jest.spyOn(userService, 'findAll').mockResolvedValue(mockUsers);

      const users = await userController.findAll();
      expect(users).toBeDefined();
      expect(Array.isArray(users)).toBe(true);
      expect(users).toEqual(mockUsers);
    });
  });

  describe('findOne', () => {
    it('should return a single user', async () => {
      const mockUser: User = {
        userId: mockData.users[0].userId,
        email: mockData.users[0].email,
        firstName: mockData.users[0].firstName,
        lastName: mockData.users[0].lastName,
        phoneNumber: mockData.users[0].phoneNumber,
        role: UserRole.VOLUNTEER,
        isVerified: true,
        disabled: false,
        isOnline: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastConnection: new Date().toISOString(),
      };

      jest.spyOn(userService, 'findOne').mockResolvedValue(mockUser);

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
      const mockMetadata: UserMetadata = {
        creationTime: new Date().toISOString(),
        lastSignInTime: new Date().toISOString(),
        lastRefreshTime: new Date().toISOString(),
        toJSON: () => ({
          creationTime: new Date().toISOString(),
          lastSignInTime: new Date().toISOString(),
          lastRefreshTime: new Date().toISOString(),
        }),
      };

      const mockCreatedUser: UserRecord = {
        uid: 'newUserId',
        email: newUser.email,
        emailVerified: false,
        disabled: false,
        metadata: mockMetadata,
        providerData: [],
        toJSON: () => ({}),
      };

      jest.spyOn(userService, 'registerUser').mockResolvedValue(mockCreatedUser);

      const createdUser = await userController.registerUser(newUser);
      expect(createdUser).toBeDefined();
      expect(createdUser.email).toBe(newUser.email);
    });

    it('should throw an error if email already exists', async () => {
      jest
        .spyOn(userService, 'registerUser')
        .mockRejectedValue(new Error('User registration failed'));

      await expect(
        userController.registerUser({
          ...newUser,
          email: 'existing@email.com',
        }),
      ).rejects.toThrow('User registration failed');
    });
  });

  describe('login', () => {
    it('should login successfully', async () => {
      const loginCredentials = {
        email: 'test@example.com',
        password: 'password123',
      };

      const mockAuthResult = {
        idToken: 'mock-token',
        refreshToken: 'mock-refresh-token',
        expiresIn: 3600,
      };

      jest.spyOn(userService, 'loginUser').mockResolvedValue(mockAuthResult);

      const result = await userController.login(loginCredentials, mockResponse);

      expect(mockResponse.cookie).toHaveBeenCalledWith('jwt', mockAuthResult.idToken, {
        httpOnly: true,
        secure: expect.any(Boolean),
        sameSite: 'strict',
        maxAge: mockAuthResult.expiresIn * 1000,
      });

      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'refresh_token',
        mockAuthResult.refreshToken,
        {
          httpOnly: true,
          secure: expect.any(Boolean),
          sameSite: 'strict',
          maxAge: 30 * 24 * 60 * 60 * 1000,
        },
      );

      expect(result).toEqual({
        message: 'Connexion réussie',
        idToken: 'mock-token',
      });
    });

    it('should throw an error on login failure', async () => {
      const loginCredentials = {
        email: 'test@example.com',
        password: 'wrong-password',
      };

      jest.spyOn(userService, 'loginUser').mockRejectedValue(new Error('Login failed'));
      jest.spyOn(console, 'error').mockImplementation(() => {});

      await expect(userController.login(loginCredentials, mockResponse)).rejects.toThrow(
        'Login failed',
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
        .mockRejectedValue(new Error("Erreur lors de la mise à jour de l'utilisateur"));

      await expect(userController.update('nonexistent-id', updateData)).rejects.toThrow(
        "Erreur lors de la mise à jour de l'utilisateur",
      );
    });
  });

  describe('delete', () => {
    it('should delete a user', async () => {
      const userId = mockData.users[0].userId;
      jest
        .spyOn(userService, 'remove')
        .mockResolvedValue({ message: 'Utilisateur supprimé avec succès' });

      const result = await userController.remove(userId);
      expect(result).toEqual({ message: 'Utilisateur supprimé avec succès' });
    });

    it('should throw error if user not found', async () => {
      jest
        .spyOn(userService, 'remove')
        .mockRejectedValue(new Error("Erreur lors de la suppression de l'utilisateur"));

      await expect(userController.remove('nonexistent-id')).rejects.toThrow(
        "Erreur lors de la suppression de l'utilisateur",
      );
    });
  });

  describe('logout', () => {
    it('should logout successfully', async () => {
      const req = { user: { uid: 'test-uid' } };
      jest.spyOn(userService, 'logout').mockResolvedValue({ message: 'Déconnexion réussie' });

      const result = await userController.logout(req, mockResponse);

      expect(mockResponse.clearCookie).toHaveBeenCalledWith('jwt', {
        httpOnly: true,
        secure: expect.any(Boolean),
        sameSite: 'strict',
      });

      expect(mockResponse.clearCookie).toHaveBeenCalledWith('refresh_token', {
        httpOnly: true,
        secure: expect.any(Boolean),
        sameSite: 'strict',
      });

      expect(result).toEqual({ message: 'Déconnexion réussie' });
    });

    it('should throw an error on logout failure', async () => {
      const req = { user: { uid: 'test-uid' } };
      jest
        .spyOn(userService, 'logout')
        .mockRejectedValue(new Error('Erreur lors de la déconnexion'));

      await expect(userController.logout(req, mockResponse)).rejects.toThrow(
        'Erreur lors de la déconnexion',
      );
    });
  });
});
