import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as firebaseAdmin from 'firebase-admin';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/roles.enum';
import { IS_PUBLIC_KEY } from '../common/decorators/public.decorator';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    console.log(`=== AUTH GUARD DEBUG ===`);

    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    console.log(`Endpoint public: ${isPublic}`);

    if (isPublic) {
      console.log(`Endpoint public, accès autorisé`);
      return true;
    }

    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    console.log(`Rôles requis:`, requiredRoles);

    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    console.log(`Header Authorization: ${authHeader ? 'Présent' : 'Absent'}`);
    console.log(`URL: ${request.url}`);
    console.log(`Méthode: ${request.method}`);

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log(`Token manquant ou format invalide`);
      throw new UnauthorizedException('Token manquant ou invalide');
    }

    const token = authHeader.split('Bearer ')[1];
    console.log(`Token extrait, longueur: ${token.length}`);

    try {
      console.log(`Vérification du token Firebase...`);
      const decodedToken = await firebaseAdmin.auth().verifyIdToken(token);
      request.user = decodedToken;

      console.log(`Token vérifié, utilisateur:`, {
        uid: decodedToken.uid,
        email: decodedToken.email,
        role: decodedToken.role,
      });

      if (!requiredRoles) {
        console.log(`Aucun rôle requis, accès autorisé`);
        return true;
      }

      const userRole = decodedToken.role as UserRole;
      console.log(`Rôle de l'utilisateur: ${userRole}`);
      console.log(`Rôles autorisés:`, requiredRoles);

      if (!userRole || !requiredRoles.includes(userRole)) {
        console.log(`Rôle insuffisant: ${userRole} (requis: ${requiredRoles.join(', ')})`);
        throw new ForbiddenException("Vous n'avez pas les droits nécessaires");
      }

      console.log(`Authentification réussie`);
      return true;
    } catch (error) {
      console.log(`Erreur d'authentification:`, error.message);
      if (error instanceof ForbiddenException) {
        throw error;
      }
      throw new UnauthorizedException('Token invalide');
    } finally {
      console.log(`=== FIN AUTH GUARD DEBUG ===`);
    }
  }
}
