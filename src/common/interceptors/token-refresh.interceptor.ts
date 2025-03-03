import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { UserService } from '../../api/user/services/user.service';
import { Response } from 'express';

@Injectable()
export class TokenRefreshInterceptor implements NestInterceptor {
  constructor(private readonly userService: UserService) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse<Response>();

    return next.handle().pipe(
      catchError(async error => {
        if (error instanceof UnauthorizedException) {
          const refreshToken = request.cookies['refresh_token'];

          if (refreshToken) {
            try {
              const {
                idToken,
                refreshToken: newRefreshToken,
                expiresIn,
              } = await this.userService.refreshAuthToken(refreshToken);

              // Mettre à jour les cookies
              response.cookie('jwt', idToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: expiresIn * 1000,
              });

              response.cookie('refresh_token', newRefreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 30 * 24 * 60 * 60 * 1000, // 30 jours
              });

              // Réessayer la requête originale
              request.cookies['jwt'] = idToken;
              return next.handle();
            } catch (refreshError) {
              // Si le refresh token est invalide, déconnecter l'utilisateur
              response.clearCookie('jwt');
              response.clearCookie('refresh_token');
              throw new UnauthorizedException('Session expirée, veuillez vous reconnecter');
            }
          }
        }
        return throwError(() => error);
      }),
    );
  }
}
