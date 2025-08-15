import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsDateString } from 'class-validator';

export class AssociationStatsFilterDto {
  @ApiProperty({
    description: 'Date de début pour le filtrage (format ISO)',
    example: '2024-01-01',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({
    description: 'Date de fin pour le filtrage (format ISO)',
    example: '2024-12-31',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({
    description: "Type d'événement à filtrer",
    example: 'collecte',
    required: false,
  })
  @IsOptional()
  @IsString()
  eventType?: string;

  @ApiProperty({
    description: 'Statut des annonces à inclure',
    example: 'active',
    required: false,
  })
  @IsOptional()
  @IsString()
  status?: string;
}
