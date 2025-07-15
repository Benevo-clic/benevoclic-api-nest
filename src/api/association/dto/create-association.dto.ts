import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { IsGeoPoint } from '../../../common/validators/geo-point.validator';
import { LocationGeoJson } from '../../../common/type/usersInfo.type';

export class CreateAssociationDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  associationName: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  phone: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  bio: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  city: string;

  @ApiProperty({
    required: false,
    description: 'GeoJSON Point au format { type: "Point", coordinates: [lng, lat] }',
    example: { type: 'Point', coordinates: [2.3522, 48.8566] },
  })
  @IsOptional()
  @IsGeoPoint({
    message: 'locationAssociation invalide : doit être { type: "Point", coordinates: [lng, lat] }',
  })
  locationAssociation?: LocationGeoJson;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  type: string;

  @ApiProperty()
  @IsString()
  postalCode?: string;

  @ApiProperty()
  @IsString()
  country?: string;
}
