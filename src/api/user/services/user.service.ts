import { Injectable, Logger } from '@nestjs/common';
import { UpdateUserDto } from '../dto/update-user.dto';
import { RegisterUserDto } from '../dto/register-user.dto';
import { LoginDto } from '../dto/login.dto';
import axios from 'axios';
import { UserRole } from '../../../common/enums/roles.enum';
import { UserRecord } from 'firebase-admin/auth';
import { UserRepository } from '../repository/user.repository';
import { FirebaseAdminService } from '../../../common/firebase/firebaseAdmin.service';
import { Location, Image } from '../../../common/type/usersInfo.type';
import { AuthConfig } from '@config/auth.config';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);
  firebaseInstance: FirebaseAdminService = FirebaseAdminService.getInstance();

  constructor(private readonly userRepository: UserRepository) {}

  async updateLocation(id: string, location: Location) {
    try {
      await this.userRepository.update(id, { location });
      return { message: 'Localisation mise à jour avec succès' };
    } catch (error) {
      this.logger.error(`Erreur lors de la mise à jour de la localisation: ${id}`, error.stack);
      throw new Error('Erreur lors de la mise à jour de la localisation');
    }
  }
  async uploadProfileImage(file: Express.Multer.File): Promise<Image> {
    if (!file) {
      throw new Error('Aucun fichier fourni.');
    }

    const base64Image = file.buffer.toString('base64');

    return {
      data: base64Image, // Image encodée en Base64
      contentType: file.mimetype,
      uploadedAt: new Date(),
    };
  }

  async updateProfilePicture(id: string, file: Express.Multer.File) {
    try {
      if (!file) {
        throw new Error('Aucun fichier fourni.');
      }

      await this.userRepository.update(id, { imageProfile: await this.uploadProfileImage(file) });
      return { message: 'Photo de profil mise à jour avec succès' };
    } catch (error) {
      this.logger.error(`Erreur lors de la mise à jour de la photo de profil: ${id}`, error.stack);
      throw new Error('Erreur lors de la mise à jour de la photo de profil');
    }
  }

  async registerUserInFirebase(registerUser: RegisterUserDto): Promise<UserRecord> {
    const isExist = await this.firebaseInstance.getUserByEmail(registerUser.email);
    if (isExist) {
      throw new Error('Email already exist');
    }
    return await this.firebaseInstance.createUser({
      displayName: registerUser.firstName,
      email: registerUser.email,
      password: registerUser.password,
    });
  }

  async registerUser(registerUser: RegisterUserDto): Promise<UserRecord> {
    try {
      const userRecord = await this.registerUserInFirebase(registerUser);
      await this.setUserRole(userRecord.uid, registerUser.role);

      await this.userRepository.create({
        _id: userRecord.uid,
        email: registerUser.email,
        firstName: registerUser.firstName,
        lastName: registerUser.lastName,
        phoneNumber: registerUser.phoneNumber,
        role: registerUser.role,
        disabled: userRecord.disabled,
        isVerified: userRecord.emailVerified,
        lastSignInTime: userRecord.metadata.lastRefreshTime,
        createdAt: userRecord.metadata.creationTime,
      });

      this.logger.log(`Inscription réussie pour l'utilisateur: ${registerUser.email}`);
      return userRecord;
    } catch (error) {
      this.logger.error(
        `Erreur lors de l'inscription de l'utilisateur: ${registerUser.email}`,
        error.stack,
      );
      throw new Error('User registration failed');
    }
  }

  async findAll() {
    return await this.userRepository.findAll();
  }

  async findOne(id: string) {
    return await this.userRepository.findByUid(id);
  }

  async updateInFirebase(id: string, updateUserDto: UpdateUserDto) {
    const updateData: any = {};
    if (updateUserDto.email) updateData.email = updateUserDto.email;
    if (updateUserDto.firstName) updateData.displayName = updateUserDto.firstName;

    await this.firebaseInstance.updateUser(id, updateData);
    this.logger.debug(`Utilisateur mis à jour dans Firebase: ${id}`);
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    try {
      this.logger.log(`Tentative de mise à jour de l'utilisateur: ${id}`);

      // Mise à jour Firebase
      await this.updateInFirebase(id, updateUserDto);

      // Mise à jour du rôle si nécessaire
      if (updateUserDto.role) {
        await this.setUserRole(id, updateUserDto.role);
        this.logger.debug(`Rôle mis à jour: ${updateUserDto.role}`);
      }

      // Mise à jour MongoDB
      await this.userRepository.update(id, {
        ...updateUserDto,
        updatedAt: new Date(),
      });

      this.logger.log(`Mise à jour réussie pour l'utilisateur: ${id}`);
      return { message: 'Utilisateur mis à jour avec succès' };
    } catch (error) {
      this.logger.error(`Erreur lors de la mise à jour de l'utilisateur: ${id}`, error.stack);
      throw new Error("Erreur lors de la mise à jour de l'utilisateur");
    }
  }

  async removeInFirebase(id: string) {
    try {
      await this.firebaseInstance.deleteUser(id);
      this.logger.debug(`Utilisateur supprimé de Firebase: ${id}`);
    } catch (error) {
      this.logger.error(`Erreur lors de la suppression de l'utilisateur: ${id}`, error.stack);
      throw new Error("Erreur lors de la suppression de l'utilisateur");
    }
  }

  async remove(id: string) {
    try {
      await this.removeInFirebase(id);

      await this.userRepository.remove(id);

      this.logger.log(`Suppression réussie de l'utilisateur: ${id}`);
      return { message: 'Utilisateur supprimé avec succès' };
    } catch (error) {
      this.logger.error(`Erreur lors de la suppression de l'utilisateur: ${id}`, error.stack);
      throw new Error("Erreur lors de la suppression de l'utilisateur");
    }
  }

  async loginUser(payload: LoginDto) {
    try {
      this.logger.log(`Tentative de connexion pour: ${payload.email}`);

      const response = await this.signInWithEmailAndPassword(payload.email, payload.password);

      // Vérifier si la réponse est valide
      if (!response || !response.idToken) {
        throw new Error("Échec de l'authentification: réponse invalide");
      }

      const { idToken, refreshToken, expiresIn } = response;

      const firebaseUser = await this.firebaseInstance.getUserByEmail(payload.email);
      await this.userRepository.updateConnectionStatus(
        firebaseUser.uid,
        true,
        firebaseUser.metadata.lastSignInTime,
      );

      this.logger.log(`Connexion réussie pour: ${payload.email}`);
      return { idToken, refreshToken, expiresIn };
    } catch (error) {
      this.logger.error(`Erreur de connexion pour: ${payload.email}`, error.stack);
      throw error;
    }
  }

  private async signInWithEmailAndPassword(email: string, password: string) {
    try {
      const url = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${AuthConfig.apiKey}`;
      const response = await axios.post(
        url,
        {
          email,
          password,
          returnSecureToken: true,
        },
        {
          headers: { 'Content-Type': 'application/json' },
        },
      );

      // Vérifier si la réponse contient les données attendues
      if (!response.data || !response.data.idToken) {
        throw new Error("Réponse invalide du serveur d'authentification");
      }

      return {
        idToken: response.data.idToken,
        refreshToken: response.data.refreshToken,
        expiresIn: response.data.expiresIn,
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        // Gérer les erreurs spécifiques à Firebase Auth
        const errorMessage =
          error.response?.data?.error?.message || "Erreur d'authentification inconnue";
        throw new Error(`Erreur d'authentification: ${errorMessage}`);
      }
      throw error;
    }
  }

  private async sendPostRequest(url: string, data: any) {
    try {
      const response = await axios.post(url, data, {
        headers: { 'Content-Type': 'application/json' },
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.error?.message || 'Erreur de requête inconnue';
        throw new Error(`Erreur lors de la requête: ${errorMessage}`);
      }
      throw error;
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
      if (error.message.includes('INVALID_REFRESH_TOKEN')) {
        throw new Error(`Invalid refresh token: ${refreshToken}.`);
      } else {
        throw new Error('Failed to refresh token');
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
      throw new Error(`Erreur lors de l'attribution du rôle: ${error.message}`);
    }
  }

  async findByRole(role: UserRole) {
    try {
      const usersResult = await this.firebaseInstance.listUsers();
      return usersResult.users.filter(user => user.customClaims?.role === role);
    } catch (error) {
      throw new Error(`Erreur lors de la recherche des utilisateurs: ${error.message}`);
    }
  }

  async logout(id: string) {
    try {
      await this.userRepository.updateConnectionStatus(id, false);
      return { message: 'Déconnexion réussie' };
    } catch (error) {
      throw new Error('Erreur lors de la déconnexion');
    }
  }

  async getProfileImage(id: string) {
    try {
      const user = await this.userRepository.findByUid(id);
      if (!user) {
        throw new Error('Utilisateur non trouvé');
      }

      if (!user.imageProfile) {
        throw new Error('Aucune image de profil trouvée');
      }

      return {
        data: user.imageProfile.data,
        contentType: user.imageProfile.contentType,
      };
    } catch (error) {
      throw new Error("Erreur lors de la récupération de l'image de profil");
    }
  }
}
