import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateFavoritesAnnouncementDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  announcementId: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  volunteerId: string;
}
