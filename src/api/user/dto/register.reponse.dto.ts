import { ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterReponseDto {
  @ApiPropertyOptional()
  uid: string;

  @ApiPropertyOptional()
  idToken: string;
}
