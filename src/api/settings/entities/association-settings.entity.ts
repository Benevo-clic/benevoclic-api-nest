import { Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('association_settings')
export class AssociationSettings {
  @PrimaryColumn()
  associationId!: string;

  @Column({ default: true })
  profileVisibility!: boolean;

  @Column({ default: false })
  contactInfoVisibility!: boolean;

  @Column({ default: true })
  eventVisibility!: boolean;

  @Column({ default: false })
  volunteerListVisibility!: boolean;

  @Column({ default: false })
  twoFactor!: boolean;

  @Column({ default: true })
  loginNotifications!: boolean;

  @Column({ default: true })
  siretVerification!: boolean;

  @Column({ default: false })
  autoApproveVolunteers!: boolean;

  @Column({ default: true })
  volunteerLimits!: boolean;

  @Column({ default: true, nullable: true })
  participantLimits?: boolean;

  @Column({ default: true })
  eventApproval!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
