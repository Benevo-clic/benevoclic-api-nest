import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Image, Location } from '../../../common/type/usersInfo.type';
import { AnnouncementStatus } from '../interfaces/announcement.interface';

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

  @ApiProperty()
  @IsNotEmpty()
  locationAnnouncement?: Location;

  @ApiProperty()
  @IsNotEmpty()
  maxParticipants: number;

  @ApiProperty()
  @IsNotEmpty()
  status: AnnouncementStatus;

  @ApiProperty()
  @IsNotEmpty()
  maxVolunteers: number;
}
