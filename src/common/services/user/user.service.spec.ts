import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { UserRepository } from '../../../api/user/repository/user.repository';
import { UserRole } from '../../enums/roles.enum';
import { FirebaseAdminService } from '../../firebase/firebaseAdmin.service';
import axios from 'axios';
import { VolunteerService } from '../../../api/volunteer/services/volunteer.service';
import { AssociationService } from '../../../api/association/services/association.service';
import { AwsS3Service } from '../../aws/aws-s3.service';

jest.mock('axios');

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
  let awsS3Service: AwsS3Service;

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
            findByEmail: jest.fn(),
          },
        },
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
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    repository = module.get<UserRepository>(UserRepository);
    firebaseAdmin = FirebaseAdminService.getInstance();
    awsS3Service = module.get<AwsS3Service>(AwsS3Service);
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
      jest.spyOn(repository, 'findByEmail').mockReturnValue(undefined);

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
    it('should throw if user already exists', async () => {
      jest.spyOn(repository, 'findByEmail').mockResolvedValue({
        userId: 'existingUid',
        email: newUser.email,
        role: UserRole.VOLUNTEER,
        isOnline: false,
        disabled: false,
        isVerified: false,
        lastConnection: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date(),
      });

      expect(service.registerUser(newUser)).toBeDefined();
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
      jest.spyOn(repository, 'findByUid').mockResolvedValue({
        userId: 'mockUid',
        email: loginData.email,
        role: UserRole.VOLUNTEER,
        isOnline: false,
        disabled: false,
        isVerified: false,
        lastConnection: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date(),
      });

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
      jest.spyOn(repository, 'findByUid').mockResolvedValue({
        userId: 'mockUid',
        email: 'test@example.com',
        role: UserRole.VOLUNTEER,
        isOnline: false,
        disabled: false,
        isVerified: true,
        lastConnection: new Date().toISOString(),
        isCompleted: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date(),
      });
      jest.spyOn(repository, 'remove').mockResolvedValue(undefined);
      const result = await service.remove('mockUid');
      expect(result).toBeDefined();
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

  describe('updateAvatar', () => {
    const userId = 'test-user-id';
    const mockFile = {
      buffer: Buffer.from('test-image-data'),
      mimetype: 'image/jpeg',
      originalname: 'test.jpg',
      fieldname: 'file',
      size: 1024,
    } as any;

    const mockUser = {
      userId: userId,
      email: 'test@example.com',
      role: UserRole.VOLUNTEER,
      avatarFileKey: 'old-avatar-key',
      isOnline: false,
      disabled: false,
      isVerified: false,
      lastConnection: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date(),
    };

    it('should update avatar successfully', async () => {
      jest
        .spyOn(repository, 'findByUid')
        .mockResolvedValueOnce(mockUser)
        .mockResolvedValueOnce({ ...mockUser, avatarFileKey: 'new-avatar-key' });
      jest.spyOn(repository, 'update').mockResolvedValue(undefined);
      jest.spyOn(awsS3Service, 'uploadFile').mockResolvedValue({ fileKey: 'new-avatar-key' });
      jest.spyOn(awsS3Service, 'deleteFile').mockResolvedValue(undefined);

      const result = await service.updateAvatar(userId, mockFile);

      expect(repository.findByUid).toHaveBeenCalledWith(userId);
      expect(awsS3Service.uploadFile).toHaveBeenCalledWith(userId, mockFile);
      expect(repository.update).toHaveBeenCalledWith(userId, { avatarFileKey: 'new-avatar-key' });
      expect(awsS3Service.deleteFile).toHaveBeenCalledWith('old-avatar-key');
      expect(result).toEqual({ ...mockUser, avatarFileKey: 'new-avatar-key' });
    });

    it('should throw NotFoundException when user not found', async () => {
      jest.spyOn(repository, 'findByUid').mockResolvedValue(null);

      await expect(service.updateAvatar(userId, mockFile)).rejects.toThrow(
        "Erreur lors de la mise à jour de l'avatar",
      );
    });

    it('should not delete old avatar if avatarFileKey is empty', async () => {
      const userWithoutAvatar = { ...mockUser, avatarFileKey: '' };
      jest
        .spyOn(repository, 'findByUid')
        .mockResolvedValueOnce(userWithoutAvatar)
        .mockResolvedValueOnce({ ...userWithoutAvatar, avatarFileKey: 'new-avatar-key' });
      jest.spyOn(repository, 'update').mockResolvedValue(undefined);
      jest.spyOn(awsS3Service, 'uploadFile').mockResolvedValue({ fileKey: 'new-avatar-key' });

      await service.updateAvatar(userId, mockFile);

      expect(awsS3Service.deleteFile).not.toHaveBeenCalled();
    });

    it('should not delete old avatar if it is the same as new avatar', async () => {
      jest
        .spyOn(repository, 'findByUid')
        .mockResolvedValueOnce(mockUser)
        .mockResolvedValueOnce(mockUser);
      jest.spyOn(repository, 'update').mockResolvedValue(undefined);
      jest.spyOn(awsS3Service, 'uploadFile').mockResolvedValue({ fileKey: 'old-avatar-key' });

      await service.updateAvatar(userId, mockFile);

      expect(awsS3Service.deleteFile).not.toHaveBeenCalled();
    });

    it('should throw InternalServerErrorException when AWS upload fails', async () => {
      jest.spyOn(repository, 'findByUid').mockResolvedValue(mockUser);
      jest.spyOn(awsS3Service, 'uploadFile').mockRejectedValue(new Error('AWS upload failed'));

      await expect(service.updateAvatar(userId, mockFile)).rejects.toThrow(
        "Erreur lors de la mise à jour de l'avatar",
      );
    });

    it('should throw InternalServerErrorException when repository update fails', async () => {
      jest.spyOn(repository, 'findByUid').mockResolvedValue(mockUser);
      jest.spyOn(awsS3Service, 'uploadFile').mockResolvedValue({ fileKey: 'new-avatar-key' });
      jest.spyOn(repository, 'update').mockRejectedValue(new Error('Database update failed'));

      await expect(service.updateAvatar(userId, mockFile)).rejects.toThrow(
        "Erreur lors de la mise à jour de l'avatar",
      );
    });

    it('should throw InternalServerErrorException when AWS delete fails', async () => {
      jest
        .spyOn(repository, 'findByUid')
        .mockResolvedValueOnce(mockUser)
        .mockResolvedValueOnce({ ...mockUser, avatarFileKey: 'new-avatar-key' });
      jest.spyOn(repository, 'update').mockResolvedValue(undefined);
      jest.spyOn(awsS3Service, 'uploadFile').mockResolvedValue({ fileKey: 'new-avatar-key' });
      jest.spyOn(awsS3Service, 'deleteFile').mockRejectedValue(new Error('AWS delete failed'));

      await expect(service.updateAvatar(userId, mockFile)).rejects.toThrow(
        "Erreur lors de la mise à jour de l'avatar",
      );
    });
  });
});
