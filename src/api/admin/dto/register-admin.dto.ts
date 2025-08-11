import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, Length } from 'class-validator';

export class RegisterAdminDto {
  @ApiProperty({ description: "The admin's email address" })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ description: "The admin's password" })
  @IsNotEmpty()
  @Length(8, 20)
  password: string;
}
