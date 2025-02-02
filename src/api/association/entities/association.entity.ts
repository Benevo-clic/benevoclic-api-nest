import { InfoVolunteer, Location, ProfileImage } from '../type/association.type';

export class Association {
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
export { ProfileImage };
