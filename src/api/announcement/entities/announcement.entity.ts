import { Location, LocationGeoJson } from '../../../common/type/usersInfo.type';
import { InfoVolunteer } from '../../association/type/association.type';
import { AnnouncementStatus } from '../interfaces/announcement.interface';

export class Announcement {
  id?: string;
  description: string;
  datePublication: string;
  dateEvent: string;
  hoursEvent: string;
  nameEvent: string;
  tags?: string[];
  associationId: string;
  associationName: string;
  associationLogo?: string;
  announcementImage?: string;
  addressAnnouncement?: Location;
  locationAnnouncement?: LocationGeoJson;
  participants?: InfoVolunteer[];
  nbParticipants?: number;
  maxParticipants: number;
  status: AnnouncementStatus;
  nbVolunteers?: number;
  maxVolunteers: number;
  volunteers?: InfoVolunteer[];
  volunteersWaiting?: InfoVolunteer[];
}
