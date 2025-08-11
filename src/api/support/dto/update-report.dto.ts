import { PartialType } from '@nestjs/mapped-types';
import { CreateReportDto } from './create-report.dto';
import { ReportPriority, ReportStatus } from '../interfaces/support.interface';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateReportDto extends PartialType(CreateReportDto) {
  @ApiPropertyOptional({ enum: ReportStatus })
  @IsOptional()
  @IsEnum(ReportStatus)
  status?: ReportStatus;

  @ApiPropertyOptional({ enum: ReportPriority })
  @IsOptional()
  @IsEnum(ReportPriority)
  priority?: ReportPriority;

  @ApiPropertyOptional({ description: "Notes de l'administrateur" })
  @IsOptional()
  @IsString()
  adminNotes?: string;
}
