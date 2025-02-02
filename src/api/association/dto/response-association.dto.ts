import { InfoVolunteer } from '../type/association.type';
import { ProfileImage } from '../../../common/type/usersInfo.type';

export class ResponseAssociationDto {
  _id: string;
  associationName: string;
  bio: string;
  location?: Location;
  city: string;
  type: string;
  postalCode: string;
  country: string;
  volunteers?: InfoVolunteer[];
  volunteersWaiting?: InfoVolunteer[];
  profileImage?: ProfileImage;
}
