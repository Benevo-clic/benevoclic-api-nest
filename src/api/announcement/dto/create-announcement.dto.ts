import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Image, Location } from '../../../common/type/usersInfo.type';

export class CreateAnnouncementDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  title: string;

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
  tags: string[];

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  associationId: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  associationName: string;

  @ApiProperty()
  @IsNotEmpty()
  associationLogo: Image;

  @ApiProperty()
  @IsNotEmpty()
  announcementImage: Image;

  @ApiProperty()
  @IsNotEmpty()
  locationAnnouncement: Location;

  @ApiProperty()
  @IsNotEmpty()
  nbParticipants: number;

  @ApiProperty()
  @IsNotEmpty()
  maxParticipants: number;

  @ApiProperty()
  @IsNotEmpty()
  isPublished: boolean;

  @ApiProperty()
  @IsNotEmpty()
  nbVolunteers: number;

  @ApiProperty()
  @IsNotEmpty()
  maxVolunteers: number;
}
