import {
  ReportType,
  ReportStatus,
  ReportPriority,
  AnnouncementReportCategory,
  TechnicalReportCategory,
  UserFeedbackReportCategory,
  OtherReportCategory,
} from '../interfaces/support.interface';

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('reports')
export class Report {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @Column({
    type: 'enum',
    enum: ReportType,
  })
  type: ReportType;

  @Column({ type: 'jsonb' })
  category:
    | AnnouncementReportCategory
    | TechnicalReportCategory
    | UserFeedbackReportCategory
    | OtherReportCategory;

  @Column()
  description: string;

  @Column({ nullable: true })
  userId?: string;

  @Column({ nullable: true })
  userEmail?: string;

  @Column({ nullable: true })
  announcementId?: string;

  @Column({
    type: 'enum',
    enum: ReportStatus,
    default: ReportStatus.PENDING,
  })
  status: ReportStatus;

  @Column({
    type: 'enum',
    enum: ReportPriority,
    default: ReportPriority.MEDIUM,
  })
  priority: ReportPriority;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  adminNotes?: string;

  @Column({ nullable: true })
  userAgent?: string;

  @Column({ nullable: true })
  pageUrl?: string;

  @Column({ nullable: true })
  browserInfo?: string;

  @Column({ nullable: true })
  deviceInfo?: string;

  @Column({ nullable: true })
  screenshotUrl?: string;
}
