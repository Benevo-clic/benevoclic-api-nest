import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { UserRole } from '../../../common/enums/roles.enum';

export class RegisterUserGoogleDto {
  @ApiProperty({ description: 'The user role' })
  @IsNotEmpty()
  @IsEnum(UserRole)
  role: UserRole = UserRole.VOLUNTEER;

  @ApiProperty({ description: 'The user idToken' })
  @IsNotEmpty()
  idToken: string;
}

export class RegisterUserGoogleResponseDto {
  token: string;
  expiresIn: number;
}
