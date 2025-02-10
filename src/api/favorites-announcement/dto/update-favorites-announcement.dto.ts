import { PartialType } from '@nestjs/mapped-types';
import { CreateFavoritesAnnouncementDto } from './create-favorites-announcement.dto';

export class UpdateFavoritesAnnouncementDto extends PartialType(CreateFavoritesAnnouncementDto) {}
