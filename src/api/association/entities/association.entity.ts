import { Entity, Column, PrimaryColumn } from 'typeorm';
import { VolunteerAssociationFollowing } from '../type/association.type';
import { LocationGeoJson } from '../../../common/type/usersInfo.type';

@Entity('associations')
export class Association {
  @PrimaryColumn()
  associationId: string;

  @Column()
  associationName: string;

  @Column()
  phone: string;

  @Column()
  bio: string;

  @Column()
  city: string;

  @Column()
  type: string;

  @Column()
  postalCode: string;

  @Column()
  country: string;

  @Column({ type: 'jsonb', nullable: true })
  locationAssociation?: LocationGeoJson;

  @Column({ type: 'jsonb', nullable: true, default: [] })
  volunteers?: VolunteerAssociationFollowing[];

  @Column({ type: 'jsonb', nullable: true, default: [] })
  volunteersWaiting?: VolunteerAssociationFollowing[];
}
