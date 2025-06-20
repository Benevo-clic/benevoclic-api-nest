import { InfoVolunteer } from '../type/association.type';

export class Association {
  associationId: string;
  associationName: string;
  phone: string;
  bio: string;
  city: string;
  type: string;
  postalCode: string;
  country: string;
  volunteers?: InfoVolunteer[];
  volunteersWaiting?: InfoVolunteer[];
}
