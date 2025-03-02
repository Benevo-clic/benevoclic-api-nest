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

    // Vérifier d'abord le cookie
    const token =
      request.cookies['jwt'] ||
      (request.headers.authorization?.startsWith('Bearer ') &&
        request.headers.authorization.split('Bearer ')[1]);

    if (!token) {
      throw new UnauthorizedException('Token manquant ou invalide');
    }

    try {
      const decodedToken = await firebaseAdmin.auth().verifyIdToken(token);
      request.user = decodedToken;

      if (!requiredRoles) {
        return true;
      }

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
