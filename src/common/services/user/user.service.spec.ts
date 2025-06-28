import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { UserRepository } from '../../../api/user/repository/user.repository';
import { UserRole } from '../../enums/roles.enum';
import { FirebaseAdminService } from '../../firebase/firebaseAdmin.service';
import axios from 'axios';

jest.mock('axios');

// Mock FirebaseAdminService
jest.mock('../../firebase/firebaseAdmin.service', () => ({
  FirebaseAdminService: {
    getInstance: jest.fn().mockReturnValue({
      getUserByEmail: jest.fn(),
      createUser: jest.fn(),
      updateUser: jest.fn(),
      deleteUser: jest.fn(),
      setCustomUserClaims: jest.fn(),
      getToken: jest.fn(),
    }),
  },
}));

describe('UserService', () => {
  let service: UserService;
  let repository: UserRepository;
  let firebaseAdmin: FirebaseAdminService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: UserRepository,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findByUid: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
            updateConnectionStatus: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    repository = module.get<UserRepository>(UserRepository);
    firebaseAdmin = FirebaseAdminService.getInstance();
  });

  describe('registerUser', () => {
    const newUser = {
      email: 'test@example.com',
      password: 'password123',
      firstName: 'Test',
      lastName: 'User',
      phoneNumber: '1234567890',
      role: UserRole.VOLUNTEER,
    };

    it('should register a new user', async () => {
      const firebaseUser = {
        uid: 'mockUid123',
        email: newUser.email,
        metadata: {
          lastSignInTime: new Date().toISOString(),
          lastRefreshTime: new Date().toISOString(),
          creationTime: new Date().toISOString(),
          toJSON: () => ({}),
        },
        disabled: false,
        emailVerified: false,
        providerData: [],
        toJSON: () => ({}),
      };

      jest.spyOn(firebaseAdmin, 'getUserByEmail').mockResolvedValue(null);
      jest.spyOn(firebaseAdmin, 'createUser').mockResolvedValue(firebaseUser);
      jest.spyOn(repository, 'create').mockResolvedValue(undefined);

      const result = await service.registerUser(newUser);
      expect(result).toBeDefined();
    });

    it('should throw if email already exists', async () => {
      jest.spyOn(firebaseAdmin, 'getUserByEmail').mockResolvedValue({
        uid: 'existingUid',
        emailVerified: false,
        disabled: false,
        metadata: {
          lastSignInTime: new Date().toISOString(),
          lastRefreshTime: new Date().toISOString(),
          creationTime: new Date().toISOString(),
          toJSON: () => ({}),
        },
        providerData: [],
        toJSON: () => ({}),
      });

      await expect(service.registerUser(newUser)).rejects.toThrow('User registration failed');
    });
  });

  describe('login', () => {
    const loginData = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should login a user successfully', async () => {
      const mockResponse = {
        data: {
          idUser: 'mockUid',
          idToken: 'mock-token',
          refreshToken: 'mock-refresh',
          expiresIn: '3600',
        },
      };

      (axios.post as jest.Mock).mockResolvedValue(mockResponse);
      jest.spyOn(firebaseAdmin, 'getUserByEmail').mockResolvedValue({
        uid: 'mockUid',
        metadata: {
          lastSignInTime: new Date().toISOString(),
          creationTime: new Date().toISOString(),
          toJSON: () => ({}),
        },
        emailVerified: false,
        disabled: false,
        providerData: [],
        toJSON: () => ({}),
      });

      const result = await service.loginUser(loginData);
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const updateData = {
        email: 'updated@example.com',
        firstName: 'Updated',
      };

      jest.spyOn(repository, 'update').mockResolvedValue(undefined);
      jest.spyOn(firebaseAdmin, 'updateUser').mockResolvedValue({
        uid: 'mockUid',
        email: updateData.email,
        emailVerified: false,
        disabled: false,
        metadata: {
          lastSignInTime: new Date().toISOString(),
          creationTime: new Date().toISOString(),
          toJSON: () => ({}),
        },
        providerData: [],
        toJSON: () => ({}),
      });

      const result = await service.update('mockUid', updateData);
      expect(result).toEqual({ message: 'Utilisateur mis à jour avec succès' });
    });
  });

  describe('remove', () => {
    it('should remove a user', async () => {
      jest.spyOn(firebaseAdmin, 'deleteUser').mockResolvedValue(undefined);
      jest.spyOn(repository, 'remove').mockResolvedValue(undefined);

      const result = await service.remove('mockUid');
      expect(result).toEqual({ message: 'Utilisateur supprimé avec succès' });
    });
  });

  describe('updateLocation', () => {
    const location = {
      address: '123 Main St',
      city: 'Paris',
      postalCode: '75001',
      country: 'France',
      lat: 48.8566,
      lng: 2.3522,
    };

    it('should update user location', async () => {
      jest.spyOn(repository, 'update').mockResolvedValue(undefined);

      const result = await service.updateLocation('mockUid', location);
      expect(result).toEqual({ message: 'Localisation mise à jour avec succès' });
    });

    it('should throw error if update fails', async () => {
      jest.spyOn(repository, 'update').mockRejectedValue(new Error('Update failed'));

      await expect(service.updateLocation('mockUid', location)).rejects.toThrow(
        'Erreur lors de la mise à jour de la localisation',
      );
    });
  });

  describe('uploadProfileImage', () => {
    const mockFile: Express.Multer.File = {
      buffer: Buffer.from('test image'),
      mimetype: 'image/jpeg',
      fieldname: 'image',
      originalname: 'test.jpg',
      encoding: '7bit',
      size: 1024,
      destination: '',
      filename: '',
      path: '',
      stream: null as any,
    };

    it('should upload profile image', async () => {
      const result = await service.uploadProfileImage(mockFile);

      expect(result).toEqual({
        data: mockFile.buffer.toString('base64'),
        contentType: mockFile.mimetype,
        uploadedAt: expect.any(Date),
      });
    });

    it('should throw if no file provided', async () => {
      await expect(service.uploadProfileImage(null as any)).rejects.toThrow(
        'Aucun fichier fourni.',
      );
    });
  });

  describe('updateProfilePicture', () => {
    const mockFile: Express.Multer.File = {
      buffer: Buffer.from('test image'),
      mimetype: 'image/jpeg',
      fieldname: 'image',
      originalname: 'test.jpg',
      encoding: '7bit',
      size: 1024,
      destination: '',
      filename: '',
      path: '',
      stream: null as any,
    };

    it('should update profile picture', async () => {
      jest.spyOn(repository, 'update').mockResolvedValue(undefined);

      const result = await service.updateProfilePicture('mockUid', mockFile);
      expect(result).toEqual({ message: 'Photo de profil mise à jour avec succès' });
    });

    it('should throw if no file provided', async () => {
      await expect(service.updateProfilePicture('mockUid', null as any)).rejects.toThrow(
        'Erreur lors de la mise à jour de la photo de profil',
      );
    });

    it('should throw if update fails', async () => {
      jest.spyOn(repository, 'update').mockRejectedValue(new Error('Update failed'));

      await expect(service.updateProfilePicture('mockUid', mockFile)).rejects.toThrow(
        'Erreur lors de la mise à jour de la photo de profil',
      );
    });
  });
});
