import { LocationGeoJson } from '../../../common/type/usersInfo.type';

export class Volunteer {
  volunteerId: string;
  bio?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  birthDate?: string;
  firstName: string;
  lastName: string;
  phone?: string;
  locationVolunteer?: LocationGeoJson;
}
