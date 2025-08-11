import { ObjectId } from 'mongodb';

export class VolunteerSettings {
  _id?: ObjectId;
  userId!: string;

  profileVisibility!: boolean;
  locationSharing!: boolean;
  activitySharing!: boolean;
  twoFactor!: boolean;

  createdAt!: Date;
  updatedAt!: Date;
}
