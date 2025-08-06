import {
  ReportType,
  ReportStatus,
  ReportPriority,
  AnnouncementReportCategory,
  TechnicalReportCategory,
} from '../interfaces/support.interface';

export class Report {
  id?: string;
  type: ReportType;
  category: AnnouncementReportCategory | TechnicalReportCategory;
  description: string;
  userId?: string;
  userEmail?: string;
  announcementId?: string;
  status: ReportStatus;
  priority: ReportPriority;
  createdAt: Date;
  updatedAt: Date;
  adminNotes?: string;
  userAgent?: string;
  pageUrl?: string;
  browserInfo?: string;
  deviceInfo?: string;
  screenshotUrl?: string;
}
