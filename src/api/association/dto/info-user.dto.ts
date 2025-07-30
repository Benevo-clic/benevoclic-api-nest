import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class InfoUserDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  volunteerId: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  volunteerName: string;
}
