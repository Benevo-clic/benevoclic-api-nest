import { Entity, Column, PrimaryColumn } from 'typeorm';
import { LocationGeoJson } from '../../../common/type/usersInfo.type';

@Entity('volunteers')
export class Volunteer {
  @PrimaryColumn()
  volunteerId: string;

  @Column({ nullable: true })
  bio?: string;

  @Column({ nullable: true })
  city?: string;

  @Column({ nullable: true })
  postalCode?: string;

  @Column({ nullable: true })
  country?: string;

  @Column({ nullable: true })
  birthDate?: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ nullable: true })
  phone?: string;

  @Column({ type: 'jsonb', nullable: true })
  locationVolunteer?: LocationGeoJson;
}
