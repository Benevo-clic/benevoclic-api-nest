import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

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
    description: 'Email du bénévole',
    example: 'john.doe@example.com',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  email: string;
}
