import { Injectable, Logger } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { RegisterUserDto } from './dto/register-user.dto';
import * as firebaseAdmin from 'firebase-admin';
import { LoginDto } from './dto/login.dto';
import axios from 'axios';
import { AuthConfig } from '../../config/auth.config';
import { UserRole } from '../../common/enums/roles.enum';
import { UserRecord } from 'firebase-admin/auth';
import { UserRepository } from './user.repository';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    private readonly authConfig: AuthConfig,
    private readonly userRepository: UserRepository,
  ) {}
  async registerUser(registerUser: RegisterUserDto): Promise<UserRecord> {
    try {
      this.logger.log(`Tentative d'inscription pour l'utilisateur: ${registerUser.email}`);

      const userRecord = await firebaseAdmin.auth().createUser({
        displayName: registerUser.firstName,
        email: registerUser.email,
        password: registerUser.password,
      });

      this.logger.debug(`Utilisateur créé dans Firebase avec l'ID: ${userRecord.uid}`);

      await this.setUserRole(userRecord.uid, registerUser.role);
      this.logger.debug(`Rôle ${registerUser.role} attribué à l'utilisateur`);

      await this.userRepository.create({
        _id: userRecord.uid,
        email: registerUser.email,
        firstName: registerUser.firstName,
        lastName: registerUser.lastName,
        phoneNumber: registerUser.phoneNumber,
        role: registerUser.role,
        disabled: userRecord.disabled,
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

  findAll() {
    return `This action returns all user`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    try {
      this.logger.log(`Tentative de mise à jour de l'utilisateur: ${id}`);

      // Mise à jour Firebase
      const updateData: any = {};
      if (updateUserDto.email) updateData.email = updateUserDto.email;
      if (updateUserDto.firstName) updateData.displayName = updateUserDto.firstName;

      await firebaseAdmin.auth().updateUser(id, updateData);
      this.logger.debug(`Utilisateur mis à jour dans Firebase: ${id}`);

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
      this.logger.debug(`Utilisateur mis à jour dans MongoDB: ${id}`);

      this.logger.log(`Mise à jour réussie pour l'utilisateur: ${id}`);
      return { message: 'Utilisateur mis à jour avec succès' };
    } catch (error) {
      this.logger.error(`Erreur lors de la mise à jour de l'utilisateur: ${id}`, error.stack);
      throw new Error("Erreur lors de la mise à jour de l'utilisateur");
    }
  }

  async remove(id: string) {
    try {
      this.logger.log(`Tentative de suppression de l'utilisateur: ${id}`);

      await firebaseAdmin.auth().deleteUser(id);
      this.logger.debug(`Utilisateur supprimé de Firebase: ${id}`);

      await this.userRepository.remove(id);
      this.logger.debug(`Utilisateur supprimé de MongoDB: ${id}`);

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

      const { idToken, refreshToken, expiresIn } = await this.signInWithEmailAndPassword(
        payload.email,
        payload.password,
      );

      const firebaseUser = await firebaseAdmin.auth().getUserByEmail(payload.email);
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
    const url = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${AuthConfig.apiKey}`;
    return await this.sendPostRequest(url, {
      email,
      password,
      returnSecureToken: true,
    });
  }

  private async sendPostRequest(url: string, data: any) {
    try {
      const response = await axios.post(url, data, {
        headers: { 'Content-Type': 'application/json' },
      });
      return response.data;
    } catch (error) {
      console.log('error', error);
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
      await firebaseAdmin.auth().setCustomUserClaims(uid, { role });
      return { message: `Rôle ${role} attribué avec succès` };
    } catch (error) {
      throw new Error(`Erreur lors de l'attribution du rôle: ${error.message}`);
    }
  }

  async findByRole(role: UserRole) {
    try {
      const usersResult = await firebaseAdmin.auth().listUsers();
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
}
