import { Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('volunteer_settings')
export class VolunteerSettings {
  @PrimaryColumn()
  userId!: string;

  @Column({ default: true })
  profileVisibility!: boolean;

  @Column({ default: false })
  locationSharing!: boolean;

  @Column({ default: true })
  activitySharing!: boolean;

  @Column({ default: false })
  twoFactor!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
