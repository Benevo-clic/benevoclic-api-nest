import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';

export class InfoVolunteerDto {
  @ApiProperty({
    description: 'ID unique du bénévole',
    example: 'vol123',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  id: string;

  @ApiProperty({
    description: 'Nom complet du bénévole',
    example: 'John Doe',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Indique si le bénévole est présent ou non',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isPresent?: boolean;
}
