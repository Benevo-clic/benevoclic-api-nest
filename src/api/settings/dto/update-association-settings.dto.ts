import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateAssociationSettingsDto {
  @ApiProperty({ description: 'Visibilité du profil', default: true })
  @IsOptional()
  @IsBoolean()
  profileVisibility?: boolean;

  @ApiProperty({ description: 'Visibilité des informations de contact', default: false })
  @IsOptional()
  @IsBoolean()
  contactInfoVisibility?: boolean;

  @ApiProperty({ description: 'Visibilité des événements', default: true })
  @IsOptional()
  @IsBoolean()
  eventVisibility?: boolean;

  @ApiProperty({ description: 'Visibilité de la liste des volontaires', default: false })
  @IsOptional()
  @IsBoolean()
  volunteerListVisibility?: boolean;

  @ApiProperty({ description: 'Authentification à deux facteurs', default: false })
  @IsOptional()
  @IsBoolean()
  twoFactor?: boolean;

  @ApiProperty({ description: 'Notifications de connexion', default: true })
  @IsOptional()
  @IsBoolean()
  loginNotifications?: boolean;

  @ApiProperty({ description: 'Vérification SIRET', default: true })
  @IsOptional()
  @IsBoolean()
  siretVerification?: boolean;

  @ApiProperty({ description: 'Approbation automatique des volontaires', default: false })
  @IsOptional()
  @IsBoolean()
  autoApproveVolunteers?: boolean;

  @ApiProperty({ description: 'Limites de volontaires', default: true })
  @IsOptional()
  @IsBoolean()
  volunteerLimits?: boolean;

  @ApiProperty({ description: 'Limites de participants', default: true })
  @IsOptional()
  @IsBoolean()
  participantLimits?: boolean;

  @ApiProperty({ description: 'Approbation des événements', default: true })
  @IsOptional()
  @IsBoolean()
  eventApproval?: boolean;
}
