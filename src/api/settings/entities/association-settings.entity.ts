import { ObjectId } from 'mongodb';

export class AssociationSettings {
  _id?: ObjectId;
  associationId!: string;

  profileVisibility!: boolean;
  contactInfoVisibility!: boolean;
  eventVisibility!: boolean;
  volunteerListVisibility!: boolean;

  twoFactor!: boolean;
  loginNotifications!: boolean;
  siretVerification!: boolean;
  autoApproveVolunteers!: boolean;
  volunteerLimits!: boolean;
  eventApproval!: boolean;

  createdAt!: Date;
  updatedAt!: Date;
}
