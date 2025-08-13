import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class UpdateVisibilityAnnouncementAssociationDTO {
  @ApiProperty({
    description: 'ID of the association to which the announcement visibility is being updated',
    example: 'assoc123',
    required: true,
  })
  @IsString()
  associationId: string;
}
