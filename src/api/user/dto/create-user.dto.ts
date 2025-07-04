import { IsEmail, IsNotEmpty, IsString, IsEnum, IsBoolean } from 'class-validator';
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
  @IsBoolean()
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
  @IsBoolean()
  isVerified: boolean;

  @ApiProperty()
  @IsBoolean()
  isCompleted?: boolean;

  @ApiProperty({ enum: UserRole })
  @IsNotEmpty()
  @IsEnum(UserRole)
  role: UserRole;
}
