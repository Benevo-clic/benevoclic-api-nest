import { ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterReponseDto {
  @ApiPropertyOptional()
  uid: string;
}
