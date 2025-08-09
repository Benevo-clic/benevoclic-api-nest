import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { UserService } from '../../../common/services/user/user.service';
import { UserRole } from '../../../common/enums/roles.enum';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(private readonly userService: UserService) {}

  async checkApprovalStatus(userId: string) {
    try {
      const user = await this.userService['userRepository'].findByUid(userId);

      if (!user) {
        throw new NotFoundException('Utilisateur non trouvé');
      }

      if (user.role !== UserRole.ADMIN) {
        return {
          approved: false,
          message: "Vous n'avez pas les permissions d'administrateur",
        };
      }

      const isComplete = user.isCompleted;
      if (!isComplete) {
        return {
          approved: false,
          message: "Votre compte n'est pas approuvé",
        };
      }

      const isApproved = true;

      return {
        approved: isApproved,
        message: isApproved
          ? 'Votre compte est approuvé'
          : "Votre compte est en attente d'approbation par un super administrateur",
      };
    } catch (error) {
      this.logger.error(
        `❌ Erreur lors de la vérification du statut: ${error.message}`,
        error.stack,
      );
      if (error instanceof NotFoundException) {
        throw new NotFoundException('Utilisateur non trouvé');
      }
      throw new BadRequestException("Erreur lors de la vérification du statut d'approbation");
    }
  }
}
