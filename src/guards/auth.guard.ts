import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  ForbiddenException,
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
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token manquant ou invalide');
    }

    const token = authHeader.split('Bearer ')[1];

    try {
      const decodedToken = await firebaseAdmin.auth().verifyIdToken(token);
      request.user = decodedToken;

      // Si aucun rôle n'est requis, on autorise l'accès
      if (!requiredRoles) {
        return true;
      }

      // Vérifie si l'utilisateur a le rôle requis
      const userRole = decodedToken.role as UserRole;
      if (!userRole || !requiredRoles.includes(userRole)) {
        throw new ForbiddenException("Vous n'avez pas les droits nécessaires");
      }

      return true;
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw error;
      }
      throw new UnauthorizedException('Token invalide');
    }
  }
}
