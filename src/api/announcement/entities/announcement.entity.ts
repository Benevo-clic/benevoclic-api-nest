import { Entity, Column, PrimaryGeneratedColumn, AfterLoad } from 'typeorm';
import { Location, LocationGeoJson } from '../../../common/type/usersInfo.type';
import { InfoVolunteer } from '../../association/type/association.type';
import { AnnouncementStatus } from '../interfaces/announcement.interface';

@Entity('announcements')
export class Announcement {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  _id?: string;

  @AfterLoad()
  updateId() {
    this._id = this.id;
  }

  @Column()
  description: string;

  @Column()
  datePublication: string;

  @Column()
  dateEvent: string;

  @Column()
  hoursEvent: string;

  @Column()
  nameEvent: string;

  @Column('text', { array: true, nullable: true })
  tags?: string[];

  @Column()
  associationId: string;

  @Column()
  associationName: string;

  @Column({ nullable: true })
  associationLogo?: string;

  @Column({ nullable: true })
  announcementImage?: string;

  @Column({ type: 'jsonb', nullable: true })
  addressAnnouncement?: Location;

  @Column({ type: 'jsonb', nullable: true })
  locationAnnouncement?: LocationGeoJson;

  @Column({ type: 'jsonb', nullable: true, default: [] })
  participants?: InfoVolunteer[];

  @Column({ nullable: true })
  nbParticipants?: number;

  @Column()
  maxParticipants: number;

  @Column({ type: 'enum', enum: AnnouncementStatus })
  status: AnnouncementStatus;

  @Column({ nullable: true, default: false })
  isHidden?: boolean;

  @Column({ nullable: true })
  nbVolunteers?: number;

  @Column()
  maxVolunteers: number;

  @Column({ type: 'jsonb', nullable: true, default: [] })
  volunteers?: InfoVolunteer[];

  @Column({ type: 'jsonb', nullable: true, default: [] })
  volunteersWaiting?: InfoVolunteer[];
}
