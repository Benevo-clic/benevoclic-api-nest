import { Entity, Column, PrimaryColumn } from 'typeorm';
import { UserRole } from '../../../common/enums/roles.enum';
import { Location, Image } from '../../../common/type/usersInfo.type';

@Entity('users')
export class User {
  @PrimaryColumn()
  userId: string;

  @Column({ unique: true })
  email: string;

  @Column({ type: 'enum', enum: UserRole })
  role: UserRole;

  @Column({ default: false })
  isOnline: boolean;

  @Column({ default: false })
  disabled: boolean;

  @Column({ default: false })
  isVerified: boolean;

  @Column({ nullable: true, default: false })
  isCompleted?: boolean;

  @Column({ type: 'jsonb', nullable: true })
  location?: Location;

  @Column({ type: 'jsonb', nullable: true })
  imageProfile?: Image;

  @Column({ nullable: true })
  avatarFileKey?: string;

  @Column()
  lastConnection: string;

  @Column()
  createdAt: string;

  @Column()
  updatedAt: Date;
}
