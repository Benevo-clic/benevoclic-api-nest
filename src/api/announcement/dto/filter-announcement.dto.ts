// src/annonces/dto/filter-annonce.dto.ts
import {
  IsOptional,
  IsString,
  IsDateString,
  IsEnum,
  IsNumber,
  IsArray,
  ArrayNotEmpty,
  ValidateIf,
  Matches,
} from 'class-validator';
import { Type } from 'class-transformer';

export class FilterAnnouncementDto {
  // Recherche textuelle sur le titre
  @IsOptional()
  @IsString()
  nameEvent?: string;

  // Recherche textuelle sur la description
  @IsOptional()
  @IsString()
  description?: string;

  // Filtre par statut
  @IsOptional()
  @IsEnum(['ACTIVE', 'INACTIVE', 'COMPLETED'])
  status?: string;

  // Intervalle d'heures pour hoursEvent, format HH:mm
  @ValidateIf(o => o.hoursEventFrom !== undefined)
  @Matches(/^\d{2}:\d{2}$/)
  hoursEventFrom?: string;

  @ValidateIf(o => o.hoursEventTo !== undefined)
  @Matches(/^\d{2}:\d{2}$/)
  hoursEventTo?: string;

  // Intervalle de dateEvent (YYYY-MM-DD)
  @IsOptional()
  @IsDateString()
  dateEventFrom?: string;

  @IsOptional()
  @IsDateString()
  dateEventTo?: string;

  // Publication relative ou calendrier
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
  radius?: number; // en mètres

  // Pagination
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number = 9;

  // Tri
  @IsOptional()
  @IsEnum(['dateEvent_asc', 'dateEvent_desc', 'datePublication_desc'])
  sort?: 'dateEvent_asc' | 'dateEvent_desc' | 'datePublication_desc' = 'datePublication_desc';
}
