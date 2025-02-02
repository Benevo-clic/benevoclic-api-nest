import { IsEmail, IsNotEmpty, IsString, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../../common/enums/roles.enum';

export class CreateUserDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  _id: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
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
  phoneNumber: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  disabled: boolean;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  lastSignInTime: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  createdAt: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  isVerified: boolean;

  @ApiProperty({ enum: UserRole })
  @IsNotEmpty()
  @IsEnum(UserRole)
  role: UserRole;
}
