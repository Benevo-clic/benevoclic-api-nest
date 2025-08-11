import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateVolunteerSettingsDto {
  @ApiProperty({ description: 'Visibilité du profil', default: true })
  @IsOptional()
  @IsBoolean()
  profileVisibility?: boolean;

  @ApiProperty({ description: 'Partage de localisation', default: false })
  @IsOptional()
  @IsBoolean()
  locationSharing?: boolean;

  @ApiProperty({ description: "Partage d'activité", default: true })
  @IsOptional()
  @IsBoolean()
  activitySharing?: boolean;

  @ApiProperty({ description: 'Authentification à deux facteurs', default: false })
  @IsOptional()
  @IsBoolean()
  twoFactor?: boolean;
}
