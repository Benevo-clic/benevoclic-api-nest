import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, Length, IsEnum } from 'class-validator';
import { UserRole } from '../../../common/enums/roles.enum';

export class RegisterUserDto {
  @ApiProperty({ description: "The user's email address" })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ description: "The user's password" })
  @IsNotEmpty()
  @Length(8, 20)
  password: string;

  @ApiProperty({ description: 'The user role' })
  @IsNotEmpty()
  @IsEnum(UserRole)
  role: UserRole = UserRole.VOLUNTEER;
}
