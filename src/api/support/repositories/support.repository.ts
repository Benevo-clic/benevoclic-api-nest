import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Report } from '../entities/report.entity';
import { CreateReportDto } from '../dto/create-report.dto';
import { UpdateReportDto } from '../dto/update-report.dto';
import { FilterReportDto } from '../dto/filter-report.dto';
import { ReportPriority, ReportStatus, ReportType } from '../interfaces/support.interface';

export interface FilterReportResponse {
  reports: Report[];
  meta: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

@Injectable()
export class SupportRepository {
  constructor(
    @InjectRepository(Report)
    private readonly repository: Repository<Report>,
  ) {}

  async create(report: CreateReportDto): Promise<Report> {
    const newReport = this.repository.create({
      ...report,
      status: ReportStatus.PENDING,
      priority: ReportPriority.MEDIUM,
    });
    return await this.repository.save(newReport);
  }

  async findAll(): Promise<Report[]> {
    return await this.repository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: string): Promise<Report | null> {
    return await this.repository.findOneBy({ id });
  }

  async findByUserId(userId: string): Promise<Report[]> {
    return await this.repository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async findByAnnouncementId(announcementId: string): Promise<Report[]> {
    return await this.repository.find({
      where: { announcementId },
      order: { createdAt: 'DESC' },
    });
  }

  async update(id: string, updateData: UpdateReportDto): Promise<Report | null> {
    const report = await this.findById(id);
    if (!report) return null;

    await this.repository.update(id, updateData);
    return await this.findById(id);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  async filterReports(filterDto: FilterReportDto): Promise<FilterReportResponse> {
    const query = this.repository.createQueryBuilder('report');

    if (filterDto.type) {
      query.andWhere('report.type = :type', { type: filterDto.type });
    }
    if (filterDto.status) {
      query.andWhere('report.status = :status', { status: filterDto.status });
    }
    if (filterDto.priority) {
      query.andWhere('report.priority = :priority', { priority: filterDto.priority });
    }
    if (filterDto.userId) {
      query.andWhere('report.userId = :userId', { userId: filterDto.userId });
    }
    if (filterDto.announcementId) {
      query.andWhere('report.announcementId = :announcementId', {
        announcementId: filterDto.announcementId,
      });
    }

    if (filterDto.createdAtFrom) {
      query.andWhere('report.createdAt >= :createdAtFrom', {
        createdAtFrom: new Date(filterDto.createdAtFrom),
      });
    }
    if (filterDto.createdAtTo) {
      query.andWhere('report.createdAt <= :createdAtTo', {
        createdAtTo: new Date(filterDto.createdAtTo),
      });
    }

    query.orderBy('report.createdAt', 'DESC');

    const page = parseInt(filterDto.page as string) || 1;
    const limit = parseInt(filterDto.limit as string) || 10;
    const skip = (page - 1) * limit;

    query.skip(skip).take(limit);

    const [reports, total] = await query.getManyAndCount();

    return {
      reports,
      meta: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getStats(): Promise<any> {
    const stats = await this.repository
      .createQueryBuilder('report')
      .select('COUNT(*)', 'total')
      .addSelect(
        `SUM(CASE WHEN report.status = '${ReportStatus.PENDING}' THEN 1 ELSE 0 END)`,
        'pending',
      )
      .addSelect(
        `SUM(CASE WHEN report.status = '${ReportStatus.IN_PROGRESS}' THEN 1 ELSE 0 END)`,
        'inProgress',
      )
      .addSelect(
        `SUM(CASE WHEN report.status = '${ReportStatus.RESOLVED}' THEN 1 ELSE 0 END)`,
        'resolved',
      )
      .addSelect(
        `SUM(CASE WHEN report.status = '${ReportStatus.REJECTED}' THEN 1 ELSE 0 END)`,
        'rejected',
      )
      .addSelect(
        `SUM(CASE WHEN report.type = '${ReportType.ANNOUNCEMENT}' THEN 1 ELSE 0 END)`,
        'announcementReports',
      )
      .addSelect(
        `SUM(CASE WHEN report.type = '${ReportType.TECHNICAL}' THEN 1 ELSE 0 END)`,
        'technicalReports',
      )
      .getRawOne();

    return {
      total: parseInt(stats.total) || 0,
      pending: parseInt(stats.pending) || 0,
      inProgress: parseInt(stats.inProgress) || 0,
      resolved: parseInt(stats.resolved) || 0,
      rejected: parseInt(stats.rejected) || 0,
      announcementReports: parseInt(stats.announcementReports) || 0,
      technicalReports: parseInt(stats.technicalReports) || 0,
    };
  }
}
