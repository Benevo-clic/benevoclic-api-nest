import { ObjectId } from 'mongodb';

export interface Announcement {
  _id?: ObjectId;
  title: string;
  description: string;
  location: string;
  startDate: Date;
  endDate: Date;
  skills: string[];
  category: string;
  status: AnnouncementStatus;
  associationId: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export enum AnnouncementStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  COMPLETED = 'COMPLETED',
}
