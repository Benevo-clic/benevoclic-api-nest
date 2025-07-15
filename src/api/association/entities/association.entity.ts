import { InfoVolunteer } from '../type/association.type';
import { LocationGeoJson } from '../../../common/type/usersInfo.type';

export class Association {
  associationId: string;
  associationName: string;
  phone: string;
  bio: string;
  city: string;
  type: string;
  postalCode: string;
  country: string;
  locationAssociation?: LocationGeoJson;
  volunteers?: InfoVolunteer[];
  volunteersWaiting?: InfoVolunteer[];
}
