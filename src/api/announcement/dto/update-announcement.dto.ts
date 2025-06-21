import { PartialType } from '@nestjs/mapped-types';
import { CreateAnnouncementDto } from './create-announcement.dto';
import { Image } from '../../../common/type/usersInfo.type';

export class UpdateAnnouncementDto extends PartialType(CreateAnnouncementDto) {
  announcementImage?: Image;
}
