import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { NotificationType, RecipientType } from '../interfaces/notification.interface';

export class CreateNotificationDto {
  @ApiProperty({ description: 'ID of the notification recipient' })
  @IsUUID()
  recipientId: string;

  @ApiProperty({ enum: RecipientType, description: 'Type of recipient' })
  @IsEnum(RecipientType)
  recipientType: RecipientType;

  @ApiProperty({ description: 'Notification message' })
  @IsString()
  message: string;

  @ApiProperty({ description: 'URL to redirect when clicking notification', required: false })
  @IsOptional()
  @IsString()
  redirectUrl?: string;

  @ApiProperty({ enum: NotificationType, description: 'Type of notification' })
  @IsEnum(NotificationType)
  type: NotificationType;

  @ApiProperty({ description: 'ID of the related entity', required: false })
  @IsOptional()
  @IsUUID()
  entityId?: string;

  @ApiProperty({ description: 'Name of the related entity', required: false })
  @IsOptional()
  @IsString()
  entityName?: string;
}
