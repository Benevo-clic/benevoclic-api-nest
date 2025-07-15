import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { LocationGeoJson } from '../../../common/type/usersInfo.type';
import { IsGeoPoint } from '../../../common/validators/geo-point.validator';

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

  @ApiProperty({
    required: false,
    description: 'Location of the volunteer in GeoJSON format',
    example: {
      type: 'Point',
      coordinates: [2.3522, 48.8566],
    },
  })
  @IsOptional()
  @IsGeoPoint({
    message: 'locationVolunteer invalide : doit être { type: "Point", coordinates: [lng, lat] }',
  })
  locationVolunteer?: LocationGeoJson;

  @ApiProperty()
  @IsString()
  birthDate?: string;
}
