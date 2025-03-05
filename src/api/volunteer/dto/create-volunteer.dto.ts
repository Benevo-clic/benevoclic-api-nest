import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateVolunteerDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  email: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  lastName: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  phone: string;

  @ApiProperty()
  @IsString()
  bio?: string;

  @ApiProperty()
  @IsString()
  city?: string;

  @ApiProperty()
  @IsString()
  postalCode?: string;

  @ApiProperty()
  @IsString()
  country?: string;

  @ApiProperty()
  @IsString()
  birthDate?: string;
}
