import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class UpdateVisibilityAnnouncementAssociationDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  associationId: string;

  @ApiProperty({
    description: 'Indicates whether the announcement is visible to the association',
    example: true,
  })
  @IsBoolean()
  isVisibleToAssociation: boolean;
}
