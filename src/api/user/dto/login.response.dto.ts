import { ApiPropertyOptional } from '@nestjs/swagger';

export class LoginResponseDto {
  @ApiPropertyOptional()
  idUser: string;

  @ApiPropertyOptional()
  idToken: string;

  @ApiPropertyOptional()
  refreshToken: string;

  @ApiPropertyOptional()
  expiresIn: string;
}
