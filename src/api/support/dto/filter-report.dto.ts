// src/api/support/dto/filter-report.dto.ts
import { IsOptional, IsString, IsEnum, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  ReportType,
  ReportStatus,
  ReportPriority,
  AnnouncementReportCategory,
  TechnicalReportCategory,
  UserFeedbackReportCategory,
  OtherReportCategory,
} from '../interfaces/support.interface';

export class FilterReportDto {
  @ApiPropertyOptional({ enum: ReportType })
  @IsOptional()
  @IsEnum(ReportType)
  type?: ReportType;

  @ApiPropertyOptional({
    description: 'Catégorie du signalement',
    enum: [
      ...Object.values(AnnouncementReportCategory),
      ...Object.values(TechnicalReportCategory),
      ...Object.values(UserFeedbackReportCategory),
      ...Object.values(OtherReportCategory),
    ],
  })
  @IsOptional()
  @IsEnum([
    ...Object.values(AnnouncementReportCategory),
    ...Object.values(TechnicalReportCategory),
    ...Object.values(UserFeedbackReportCategory),
    ...Object.values(OtherReportCategory),
  ])
  category?:
    | AnnouncementReportCategory
    | TechnicalReportCategory
    | UserFeedbackReportCategory
    | OtherReportCategory;

  @ApiPropertyOptional({ enum: ReportStatus })
  @IsOptional()
  @IsEnum(ReportStatus)
  status?: ReportStatus;

  @ApiPropertyOptional({ enum: ReportPriority })
  @IsOptional()
  @IsEnum(ReportPriority)
  priority?: ReportPriority;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  announcementId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  createdAtFrom?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  createdAtTo?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  page?: string = '1';

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  limit?: string = '10';
}
