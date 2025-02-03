import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class IdUserDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  id: string;
}
