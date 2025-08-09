import {
  ArrayNotEmpty,
  IsArray,
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  ValidateIf,
} from 'class-validator';
import { Type } from 'class-transformer';

export class FilterAnnouncementDto {
  @IsOptional()
  @IsString()
  nameEvent?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(['ACTIVE', 'INACTIVE', 'COMPLETED'])
  status?: string;

  @ValidateIf(o => o.hoursEventFrom !== undefined)
  @Matches(/^\d{2}:\d{2}$/)
  hoursEventFrom?: string;

  @ValidateIf(o => o.hoursEventTo !== undefined)
  @Matches(/^\d{2}:\d{2}$/)
  hoursEventTo?: string;

  @IsOptional()
  @IsDateString()
  dateEventFrom?: string;

  @IsOptional()
  @IsDateString()
  dateEventTo?: string;

  @IsOptional()
  @IsEnum(['1h', '5h', '1d', '1w', '1M'])
  publicationInterval?: '1h' | '5h' | '1d' | '1w' | '1M';

  @IsOptional()
  @IsDateString()
  datePublicationFrom?: string;

  @IsOptional()
  @IsDateString()
  datePublicationTo?: string;

  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsString()
  associationName?: string;

  @ValidateIf(o => o.latitude !== undefined && o.longitude !== undefined)
  @Type(() => Number)
  @IsNumber()
  latitude?: number;

  @ValidateIf(o => o.latitude !== undefined && o.longitude !== undefined)
  @Type(() => Number)
  @IsNumber()
  longitude?: number;

  @ValidateIf(o => o.latitude !== undefined && o.longitude !== undefined)
  @Type(() => Number)
  @IsNumber()
  radius?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number = 9;

  @IsOptional()
  @IsEnum(['dateEvent_asc', 'dateEvent_desc', 'datePublication_desc'])
  sort?: 'dateEvent_asc' | 'dateEvent_desc' | 'datePublication_desc' | 'ddatePublication_asc' =
    'datePublication_desc';
}
