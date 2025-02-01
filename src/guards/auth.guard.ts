import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import * as firebaseAdmin from 'firebase-admin';

@Injectable()
export class AuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token manquant ou invalide');
    }

    const token = authHeader.split('Bearer ')[1];

    try {
      request.user = await firebaseAdmin.auth().verifyIdToken(token);
      return true;
    } catch (error) {
      throw new UnauthorizedException('Token invalide');
    }
  }
}
