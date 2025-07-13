import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { UpdateUserDto } from '../../../api/user/dto/update-user.dto';
import { RegisterUserDto } from '../../../api/user/dto/register-user.dto';
import { LoginDto } from '../../../api/user/dto/login.dto';
import axios from 'axios';
import { UserRole } from '../../enums/roles.enum';
import { UserRecord } from 'firebase-admin/auth';
import { UserRepository } from '../../../api/user/repository/user.repository';
import { FirebaseAdminService } from '../../firebase/firebaseAdmin.service';
import { Location, Image } from '../../type/usersInfo.type';
import { LoginResponseDto } from '../../../api/user/dto/login.response.dto';
import { RegisterReponseDto } from '../../../api/user/dto/register.reponse.dto';
import { RegisterUserVerifiedDto } from '../../../api/user/dto/register-user-verified.dto';
import {
  RegisterUserGoogleDto,
  RegisterUserGoogleResponseDto,
} from '../../../api/user/dto/register-user-google.dto';
import { AuthConfig } from '@config/auth.config';
import { User } from '../../../api/user/entities/user.entity';
import { VolunteerService } from '../../../api/volunteer/services/volunteer.service';
import { AssociationService } from '../../../api/association/services/association.service';
import { fileSchema } from '../../utils/file-utils';
import { z } from 'zod';
import { AwsS3Service } from '../../aws/aws-s3.service';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);
  firebaseInstance: FirebaseAdminService = FirebaseAdminService.getInstance();

  constructor(
    private readonly userRepository: UserRepository,
    private readonly volunteerService: VolunteerService,
    private readonly associationService: AssociationService,
    private readonly awsS3Service: AwsS3Service,
  ) {}

  async updateLocation(id: string, location: Location) {
    try {
      await this.userRepository.update(id, { location });
      return { message: 'Localisation mise à jour avec succès' };
    } catch (error) {
      this.logger.error(`Erreur lors de la mise à jour de la localisation: ${id}`, error.stack);
      throw error instanceof BadRequestException || error instanceof NotFoundException
        ? error
        : new InternalServerErrorException('Erreur lors de la mise à jour de la localisation');
    }
  }

  async uploadProfileImage(file: Express.Multer.File): Promise<Image> {
    try {
      if (!file) {
        throw new BadRequestException('Aucun fichier fourni.');
      }
      const base64Image = file.buffer.toString('base64');
      return {
        data: base64Image,
        contentType: file.mimetype,
        uploadedAt: new Date(),
      };
    } catch (error) {
      this.logger.error("Erreur lors de l'upload de la photo de profil", error.stack);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException("Erreur lors de l'upload de la photo de profil");
    }
  }

  async getUserImageProfile(id: string): Promise<Image> {
    try {
      const user = await this.userRepository.findByUid(id);
      if (!user || !user.imageProfile) {
        throw new NotFoundException('Aucune image de profil trouvée pour cet utilisateur.');
      }
      return user.imageProfile;
    } catch (error) {
      this.logger.error(`Erreur lors de la récupération de l'image de profil: ${id}`, error.stack);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException("Erreur lors de la récupération de l'image de profil");
    }
  }

  async updateProfilePicture(id: string, file: Express.Multer.File) {
    try {
      if (!file) {
        throw new BadRequestException('Aucun fichier fourni.');
      }
      await this.userRepository.update(id, { imageProfile: await this.uploadProfileImage(file) });
      return { message: 'Photo de profil mise à jour avec succès' };
    } catch (error) {
      this.logger.error(`Erreur lors de la mise à jour de la photo de profil: ${id}`, error.stack);
      throw new InternalServerErrorException('Erreur lors de la mise à jour de la photo de profil');
    }
  }

  async updateAvatar(id: string, submittedFile: z.infer<typeof fileSchema>) {
    try {
      const existingUser = await this.userRepository.findByUid(id);
      if (!existingUser) {
        this.logger.error(`Utilisateur non trouvé: ${id}`);
        throw new NotFoundException('Utilisateur non trouvé');
      }
      const { fileKey } = await this.awsS3Service.uploadFile(id, submittedFile);
      await this.userRepository.update(id, { avatarFileKey: fileKey });
      this.logger.log(`Avatar mis à jour pour l'utilisateur: ${id}`);

      if (existingUser.avatarFileKey && existingUser.avatarFileKey !== fileKey) {
        await this.awsS3Service.deleteFile(existingUser.avatarFileKey);
        this.logger.log(`Ancien avatar supprimé pour l'utilisateur: ${id}`);
      }
      return this.userRepository.findByUid(id);
    } catch (error) {
      this.logger.error(`Erreur lors de la mise à jour de l'avatar: ${id}`, error.stack);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException("Erreur lors de la mise à jour de l'avatar");
    }
  }

  async getAvatarFileUrl(id: string): Promise<string> {
    try {
      const user = await this.userRepository.findByUid(id);
      if (!user || !user.avatarFileKey) {
        this.logger.error(`Aucun avatar trouvé pour l'utilisateur: ${id}`);
        return '';
      }
      return await this.awsS3Service.getFileUrl(user.avatarFileKey);
    } catch (error) {
      this.logger.error(`Erreur lors de la récupération de l'URL de l'avatar: ${id}`, error.stack);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException("Erreur lors de la récupération de l'URL de l'avatar");
    }
  }

  async registerUserInFirebase(registerUser: RegisterUserDto): Promise<UserRecord> {
    try {
      const isExist = await this.firebaseInstance.getUserByEmail(registerUser.email);
      if (isExist) {
        throw new BadRequestException('Email already exist');
      }
      return await this.firebaseInstance.createUser({
        email: registerUser.email,
        password: registerUser.password,
      });
    } catch (error) {
      this.logger.error(
        `Erreur lors de l'inscription Firebase: ${registerUser.email}`,
        error.stack,
      );
      throw new InternalServerErrorException('User registration failed');
    }
  }

  async getCurrentUser(req: any): Promise<User | null> {
    try {
      const currentUser = await FirebaseAdminService.getInstance().getCurrentUser(req);
      if (!currentUser) {
        this.logger.error('Utilisateur non trouvé');
        throw new NotFoundException('Utilisateur non trouvé');
      }
      let avatarFileKey = '';
      const user = await this.userRepository.findByUid(currentUser.uid);
      if (user.avatarFileKey) {
        avatarFileKey = await this.getAvatarFileUrl(currentUser.uid);
      }

      return {
        ...user,
        avatarFileKey,
      };
    } catch (error) {
      this.logger.error("Erreur lors de la récupération de l'utilisateur courant", error.stack);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        "Erreur lors de la récupération de l'utilisateur courant",
      );
    }
  }

  async registerWithGoogle(
    registerUser: RegisterUserGoogleDto,
  ): Promise<RegisterUserGoogleResponseDto> {
    try {
      const decodedToken = await this.firebaseInstance.verifyIdToken(registerUser.idToken);
      const userRecord = await this.firebaseInstance.getUserByEmail(decodedToken.email);
      if (!userRecord) {
        throw new NotFoundException('User not found');
      }
      await this.firebaseInstance.setCustomUserClaims(userRecord.uid, { role: registerUser.role });
      const customToken = await this.firebaseInstance.getToken(userRecord.uid);
      await this.userRepository.create({
        _id: userRecord.uid,
        email: userRecord.email,
        role: registerUser.role,
        disabled: userRecord.disabled,
        isVerified: userRecord.emailVerified,
        lastSignInTime: userRecord.metadata.lastRefreshTime,
        isCompleted: false,
        createdAt: userRecord.metadata.creationTime,
      });
      await this.updateConnectionStatus(userRecord.uid, true, userRecord.metadata.lastSignInTime);
      return {
        idUser: userRecord.uid,
        token: customToken,
        expiresIn: 3600,
      };
    } catch (error) {
      this.logger.error(
        `Erreur lors de l'inscription Google: idToken=${registerUser.idToken}, role=${registerUser.role}`,
        error.stack,
      );
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('User registration failed');
    }
  }

  async registerWithEmailAndPasswordVerification(
    registerUser: RegisterUserVerifiedDto,
  ): Promise<RegisterReponseDto> {
    try {
      const userRecord = await this.firebaseInstance.getUserByEmail(registerUser.email);
      if (!userRecord) {
        throw new NotFoundException('User not found');
      }
      await this.setUserRole(userRecord.uid, registerUser.role);
      await this.userRepository.create({
        _id: userRecord.uid,
        email: registerUser.email,
        role: registerUser.role,
        disabled: userRecord.disabled,
        isVerified: userRecord.emailVerified,
        isCompleted: false,
        lastSignInTime: userRecord.metadata.lastRefreshTime,
        createdAt: userRecord.metadata.creationTime,
      });
      return {
        uid: userRecord.uid,
      };
    } catch (error) {
      this.logger.error(
        `Erreur lors de l'inscription vérifiée: ${registerUser.email}`,
        error.stack,
      );
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('User registration with verification failed');
    }
  }

  async registerUser(registerUser: RegisterUserDto): Promise<RegisterReponseDto> {
    try {
      const existingUser = await this.userRepository.findByEmail(registerUser.email);
      if (existingUser) {
        this.logger.error(`Email déjà utilisé: ${registerUser.email}`);
        throw new BadRequestException('Email already exists');
      }

      const userRecord = await this.registerUserInFirebase(registerUser);
      await this.setUserRole(userRecord.uid, registerUser.role);
      await this.userRepository.create({
        _id: userRecord.uid,
        email: registerUser.email,
        role: registerUser.role,
        disabled: userRecord.disabled,
        isVerified: userRecord.emailVerified,
        isCompleted: false,
        lastSignInTime: userRecord.metadata.lastRefreshTime,
        createdAt: userRecord.metadata.creationTime,
      });
      this.logger.log(`Inscription réussie pour l'utilisateur: ${registerUser.email}`);
      return {
        uid: userRecord.uid,
      };
    } catch (error) {
      this.logger.error(
        `Erreur lors de l'inscription de l'utilisateur: ${registerUser.email}`,
        error.stack,
      );
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('User registration failed');
    }
  }

  async findAll() {
    try {
      return await this.userRepository.findAll();
    } catch (error) {
      this.logger.error('Erreur lors de la récupération des utilisateurs', error.stack);
      throw new InternalServerErrorException('Erreur lors de la récupération des utilisateurs');
    }
  }

  async findOne(id: string) {
    try {
      const currentUser = await this.userRepository.findByUid(id);
      if (!currentUser) {
        throw new NotFoundException('Utilisateur non trouvé');
      }
      let avatarFileKey = '';
      const user = await this.userRepository.findByUid(currentUser.userId);
      if (user.avatarFileKey) {
        avatarFileKey = await this.getAvatarFileUrl(user.userId);
      }

      return {
        ...user,
        avatarFileKey,
      };
    } catch (error) {
      this.logger.error(`Erreur lors de la récupération de l'utilisateur: ${id}`, error.stack);
      throw error instanceof NotFoundException
        ? error
        : new InternalServerErrorException("Erreur lors de la récupération de l'utilisateur");
    }
  }

  async updateInFirebase(id: string, updateUserDto: UpdateUserDto) {
    try {
      const updateData: any = {};
      if (updateUserDto.email) updateData.email = updateUserDto.email;
      await this.firebaseInstance.updateUser(id, updateData);
      this.logger.debug(`Utilisateur mis à jour dans Firebase: ${id}`);
    } catch (error) {
      this.logger.error(`Erreur lors de la mise à jour Firebase: ${id}`, error.stack);
      throw new InternalServerErrorException('Erreur lors de la mise à jour Firebase');
    }
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    try {
      this.logger.log(`Tentative de mise à jour de l'utilisateur: ${id}`);
      await this.updateInFirebase(id, updateUserDto);
      if (updateUserDto.role) {
        await this.setUserRole(id, updateUserDto.role);
        this.logger.debug(`Rôle mis à jour: ${updateUserDto.role}`);
      }
      await this.userRepository.update(id, {
        ...updateUserDto,
        updatedAt: new Date(),
      });
      this.logger.log(`Mise à jour réussie pour l'utilisateur: ${id}`);
      return { message: 'Utilisateur mis à jour avec succès' };
    } catch (error) {
      this.logger.error(`Erreur lors de la mise à jour de l'utilisateur: ${id}`, error.stack);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException("Erreur lors de la mise à jour de l'utilisateur");
    }
  }

  async removeInFirebase(id: string) {
    try {
      await this.firebaseInstance.deleteUser(id);
      this.logger.debug(`Utilisateur supprimé de Firebase: ${id}`);
    } catch (error) {
      this.logger.error(`Erreur lors de la suppression de l'utilisateur: ${id}`, error.stack);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException("Erreur lors de la suppression de l'utilisateur");
    }
  }

  async remove(id: string) {
    try {
      const user = await this.userRepository.findByUid(id);
      if (!user) {
        this.logger.error(`Utilisateur non trouvé: ${id}`);
        throw new NotFoundException('Utilisateur non trouvé');
      }
      if (user.role === UserRole.ASSOCIATION) {
        await this.associationService.remove(id);
        this.logger.log(`Suppression réussie de l'association: ${id}`);
      } else if (user.role === UserRole.VOLUNTEER) {
        await this.volunteerService.remove(id);
        this.logger.log(`Suppression réussie du bénévole: ${id}`);
      }

      await this.removeInFirebase(id);
      await this.userRepository.remove(id);
      this.logger.log(`Suppression réussie de l'utilisateur: ${id}`);
      return { message: 'Utilisateur supprimé avec succès' };
    } catch (error) {
      this.logger.error(`Erreur lors de la suppression de l'utilisateur: ${id}`, error.stack);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException("Erreur lors de la suppression de l'utilisateur");
    }
  }

  async loginUser(payload: LoginDto): Promise<LoginResponseDto> {
    try {
      this.logger.log(`Tentative de connexion pour: ${payload.email}`);
      const response = await this.signInWithEmailAndPassword(payload.email, payload.password);
      if (!response || !response.idToken) {
        this.logger.error(
          `Identifiants invalides ou réponse Firebase incorrecte pour: ${payload.email}`,
        );
        throw new BadRequestException('Identifiants invalides ou réponse Firebase incorrecte');
      }
      const { idToken, refreshToken, expiresIn } = response;
      const firebaseUser = await this.firebaseInstance.getUserByEmail(payload.email);

      await this.updateConnectionStatus(
        firebaseUser.uid,
        true,
        firebaseUser.metadata.lastSignInTime,
      );
      this.logger.log(`Connexion réussie pour: ${payload.email}`);
      return {
        idUser: firebaseUser.uid,
        idToken,
        refreshToken,
        expiresIn,
      };
    } catch (error) {
      this.logger.error(`Erreur de connexion pour: ${payload.email}`, error.stack);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Erreur de connexion');
    }
  }

  async updateIsCompleted(id: string, isCompleted: boolean): Promise<User | null> {
    try {
      await this.userRepository.updateIsComplete(id, isCompleted);
      return await this.userRepository.findByUid(id);
    } catch (error) {
      this.logger.error(
        `Erreur lors de la mise à jour de l'état de complétion: ${id}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        "Erreur lors de la mise à jour de l'état de complétion",
      );
    }
  }

  async updateConnectionStatus(id: string, isConnected: boolean, lastSignInTime?: string) {
    try {
      await this.userRepository.updateConnectionStatus(id, isConnected, lastSignInTime);
      return this.userRepository.findByUid(id);
    } catch (error) {
      this.logger.error(`Erreur lors de la mise à jour du statut de connexion: ${id}`, error.stack);
      throw new InternalServerErrorException(
        'Erreur lors de la mise à jour du statut de connexion',
      );
    }
  }

  private async signInWithEmailAndPassword(email: string, password: string) {
    try {
      const url = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${AuthConfig.apiKey}`;
      return await this.sendPostRequest(url, {
        email,
        password,
        returnSecureToken: true,
      });
    } catch (error) {
      this.logger.error('Erreur lors de la connexion avec email/mot de passe', error.stack);
      throw new InternalServerErrorException('Erreur lors de la connexion avec email/mot de passe');
    }
  }

  private async sendPostRequest(url: string, data: any) {
    try {
      const response = await axios.post(url, data, {
        headers: { 'Content-Type': 'application/json' },
      });
      return response.data;
    } catch (error) {
      this.logger.error('Erreur lors de la requête HTTP', error.stack);
      throw new InternalServerErrorException('Erreur lors de la requête HTTP');
    }
  }

  async refreshAuthToken(refreshToken: string) {
    try {
      const {
        id_token: idToken,
        refresh_token: newRefreshToken,
        expires_in: expiresIn,
      } = await this.sendRefreshAuthTokenRequest(refreshToken);
      return {
        idToken,
        refreshToken: newRefreshToken,
        expiresIn,
      };
    } catch (error: any) {
      this.logger.error('Erreur lors du refresh du token', error.stack);
      if (error.message.includes('INVALID_REFRESH_TOKEN')) {
        throw new BadRequestException(`Invalid refresh token: ${refreshToken}.`);
      } else {
        throw new InternalServerErrorException('Failed to refresh token');
      }
    }
  }

  private async sendRefreshAuthTokenRequest(refreshToken: string) {
    const url = `https://securetoken.googleapis.com/v1/token?key=${AuthConfig.apiKey}`;
    const payload = {
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    };
    return await this.sendPostRequest(url, payload);
  }

  async setUserRole(uid: string, role: UserRole) {
    try {
      await this.firebaseInstance.setCustomUserClaims(uid, { role });
      return { message: `Rôle ${role} attribué avec succès` };
    } catch (error) {
      this.logger.error(`Erreur lors de l'attribution du rôle: ${uid}`, error.stack);
      throw new InternalServerErrorException(
        `Erreur lors de l'attribution du rôle: ${error.message}`,
      );
    }
  }

  async findByRole(role: UserRole) {
    try {
      const usersResult = await this.firebaseInstance.listUsers();
      return usersResult.users.filter(user => user.customClaims?.role === role);
    } catch (error) {
      this.logger.error('Erreur lors de la recherche des utilisateurs', error.stack);
      throw new InternalServerErrorException(
        `Erreur lors de la recherche des utilisateurs: ${error.message}`,
      );
    }
  }

  async findByEmail(email: string) {
    try {
      return await this.userRepository.findByEmail(email);
    } catch (error) {
      this.logger.error("Erreur lors de la recuperation de l'utilisateur par email", error.stack);
      throw new InternalServerErrorException("Erreur lors de la récupération de l'utilisateur");
    }
  }

  async logout(id: string) {
    try {
      await this.updateConnectionStatus(id, false);
      return { message: 'Déconnexion réussie' };
    } catch (error) {
      this.logger.error(`Erreur lors de la déconnexion: ${id}`, error.stack);
      throw new InternalServerErrorException('Erreur lors de la déconnexion');
    }
  }

  async getProfileImage(id: string) {
    try {
      const user = await this.userRepository.findByUid(id);
      if (!user) {
        throw new NotFoundException('Utilisateur non trouvé');
      }
      if (!user.imageProfile) {
        throw new NotFoundException('Aucune image de profil trouvée');
      }
      return {
        data: user.imageProfile.data,
        contentType: user.imageProfile.contentType,
      };
    } catch (error) {
      this.logger.error(`Erreur lors de la récupération de l'image de profil: ${id}`, error.stack);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException("Erreur lors de la récupération de l'image de profil");
    }
  }
}
