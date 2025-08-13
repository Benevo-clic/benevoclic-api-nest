import { Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { AuthGuard } from '../../../guards/auth.guard';
import { FirebaseAdminService } from '../../../common/firebase/firebaseAdmin.service';

@Controller('auth')
export class SessionController {
  constructor(private readonly firebaseAdminService: FirebaseAdminService) {}

  @Get('session')
  @UseGuards(AuthGuard)
  async verifySession(@Req() req: any) {
    const user = req.user;

    return {
      isValid: true,
      user: {
        uid: user.uid,
        role: user.role,
        email: user.email,
        emailVerified: user.email_verified,
      },
      expiresAt: user.exp * 1000, // Timestamp en millisecondes
      issuedAt: user.iat * 1000,
      lastActivity: Date.now(),
    };
  }

  @Post('session/refresh')
  @UseGuards(AuthGuard)
  async refreshSession(@Req() req: any, @Res() res: Response) {
    const user = req.user;

    try {
      // Créer un nouveau token de session
      const sessionToken = await this.createSessionToken(user.uid);

      // Définir le cookie de session durable
      res.cookie('__session', sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours
        path: '/',
      });

      return res.json({
        success: true,
        message: 'Session rafraîchie avec succès',
        user: {
          uid: user.uid,
          role: user.role,
          email: user.email,
        },
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Erreur lors du rafraîchissement de session',
        error: error.message,
      });
    }
  }

  @Post('session/validate')
  async validateSession(@Req() req: any) {
    const sessionToken = req.cookies?.['__session'];
    const authHeader = req.headers.authorization;

    if (!sessionToken && (!authHeader || !authHeader.startsWith('Bearer '))) {
      return {
        isValid: false,
        message: 'Aucun token de session trouvé',
      };
    }

    try {
      let decodedToken;

      if (sessionToken) {
        // Vérifier le token de session
        decodedToken = await this.verifySessionToken(sessionToken);
      } else {
        // Vérifier le token d'autorisation
        const token = authHeader.split('Bearer ')[1];
        decodedToken = await this.firebaseAdminService.verifyIdToken(token);
      }

      return {
        isValid: true,
        user: {
          uid: decodedToken.uid,
          role: decodedToken.role,
          email: decodedToken.email,
          emailVerified: decodedToken.email_verified,
        },
        expiresAt: decodedToken.exp * 1000,
      };
    } catch (error) {
      return {
        isValid: false,
        message: 'Token de session invalide ou expiré',
        error: error.message,
      };
    }
  }

  private async createSessionToken(uid: string): Promise<string> {
    // Créer un token personnalisé pour la session
    const customToken = await this.firebaseAdminService.getToken(uid);
    return customToken;
  }

  private async verifySessionToken(sessionToken: string): Promise<any> {
    // Vérifier le token de session
    return await this.firebaseAdminService.verifyIdToken(sessionToken);
  }
}
