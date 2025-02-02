import { InfoVolunteer } from '../type/association.type';

export class Association {
  _id: string;
  associationName: string;
  bio: string;
  city: string;
  type: string;
  postalCode: string;
  country: string;
  volunteers?: InfoVolunteer[];
  volunteersWaiting?: InfoVolunteer[];
}
