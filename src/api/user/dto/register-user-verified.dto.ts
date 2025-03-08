import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsEnum } from 'class-validator';
import { UserRole } from '../../../common/enums/roles.enum';

export class RegisterUserVerifiedDto {
  @ApiProperty({ description: "The user's email address" })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'The user role' })
  @IsNotEmpty()
  @IsEnum(UserRole)
  role: UserRole = UserRole.VOLUNTEER;
}
