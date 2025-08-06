// src/api/support/dto/create-report.dto.ts
import { IsNotEmpty, IsOptional, IsString, IsEnum, IsEmail } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ReportType,
  AnnouncementReportCategory,
  TechnicalReportCategory,
} from '../interfaces/support.interface';

export class CreateReportDto {
  @ApiProperty({ enum: ReportType, description: 'Type de signalement' })
  @IsNotEmpty()
  @IsEnum(ReportType)
  type: ReportType;

  @ApiProperty({
    description: 'Catégorie du signalement',
    enum: [...Object.values(AnnouncementReportCategory), ...Object.values(TechnicalReportCategory)],
  })
  @IsNotEmpty()
  @IsEnum([...Object.values(AnnouncementReportCategory), ...Object.values(TechnicalReportCategory)])
  category: AnnouncementReportCategory | TechnicalReportCategory;

  @ApiProperty({ description: 'Description détaillée du problème' })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiPropertyOptional({ description: "ID de l'annonce concernée" })
  @IsOptional()
  @IsString()
  announcementId?: string;

  @ApiPropertyOptional({ description: "Email de l'utilisateur" })
  @IsOptional()
  @IsEmail()
  userEmail?: string;

  @ApiPropertyOptional({ description: 'Informations du navigateur' })
  @IsOptional()
  @IsString()
  userAgent?: string;

  @ApiPropertyOptional({ description: 'URL de la page où le problème a été signalé' })
  @IsOptional()
  @IsString()
  pageUrl?: string;

  @ApiPropertyOptional({ description: 'Informations du navigateur' })
  @IsOptional()
  @IsString()
  browserInfo?: string;

  @ApiPropertyOptional({ description: "Informations de l'appareil" })
  @IsOptional()
  @IsString()
  deviceInfo?: string;
}
