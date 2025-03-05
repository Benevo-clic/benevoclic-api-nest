import { ApiPropertyOptional } from '@nestjs/swagger';

export class LoginResponseDto {
  @ApiPropertyOptional()
  idToken: string;

  @ApiPropertyOptional()
  refreshToken: string;

  @ApiPropertyOptional()
  expiresIn: string;
}
