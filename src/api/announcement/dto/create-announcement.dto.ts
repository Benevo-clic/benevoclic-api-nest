import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Location, LocationGeoJson } from '../../../common/type/usersInfo.type';
import { AnnouncementStatus } from '../interfaces/announcement.interface';
import { IsGeoPoint } from '../../../common/validators/geo-point.validator';

export class CreateAnnouncementDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  datePublication: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  dateEvent: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  hoursEvent: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  nameEvent: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString({ each: true })
  tags?: string[];

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  associationId: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  associationName: string;

  @ApiProperty({
    required: false,
    description: "adresse de l'annonce",
    example: {
      address: '10 rue de Paris',
      city: 'Paris',
      postalCode: '75001',
      country: 'France',
    },
  })
  @IsNotEmpty()
  addressAnnouncement?: Location;

  @ApiProperty({
    required: false,
    description: 'GeoJSON Point au format { type: "Point", coordinates: [lng, lat] }',
    example: { type: 'Point', coordinates: [2.3522, 48.8566] },
  })
  @IsOptional()
  @IsGeoPoint({
    message: 'locationAnnouncement invalide : doit être { type: "Point", coordinates: [lng, lat] }',
  })
  locationAnnouncement?: LocationGeoJson;

  @ApiProperty()
  @IsNotEmpty()
  maxParticipants: number;

  @ApiProperty({
    enum: AnnouncementStatus,
    description: "Statut de l'annonce",
    example: AnnouncementStatus.ACTIVE,
  })
  @IsNotEmpty()
  status: AnnouncementStatus;

  @ApiProperty()
  @IsNotEmpty()
  maxVolunteers: number;
}
