import { Inject, Injectable } from '@nestjs/common';
import { Collection, MongoClient, ObjectId } from 'mongodb';
import { DatabaseCollection } from '../../../common/enums/database.collection';
import { Report } from '../entities/report.entity';
import { CreateReportDto } from '../dto/create-report.dto';
import { UpdateReportDto } from '../dto/update-report.dto';
import { FilterReportDto } from '../dto/filter-report.dto';
import { MONGODB_CONNECTION } from '../../../database/mongodb.provider';
import { ReportPriority, ReportStatus } from '../interfaces/support.interface';

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
  private collection: Collection<Report>;

  constructor(@Inject(MONGODB_CONNECTION) private readonly mongoClient: MongoClient) {
    this.collection = this.mongoClient.db().collection<Report>(DatabaseCollection.SUPPORT);
  }

  async create(report: CreateReportDto): Promise<Report> {
    const newReport: Report = {
      ...report,
      status: ReportStatus.PENDING,
      priority: ReportPriority.MEDIUM,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await this.collection.insertOne(newReport);
    return { ...newReport, id: result.insertedId.toString() };
  }

  async findAll(): Promise<Report[]> {
    return await this.collection.find().sort({ createdAt: -1 }).toArray();
  }

  async findById(id: string): Promise<Report | null> {
    try {
      return await this.collection.findOne({ _id: new ObjectId(id) });
    } catch (error) {
      return null;
    }
  }

  async findByUserId(userId: string): Promise<Report[]> {
    return await this.collection.find({ userId }).sort({ createdAt: -1 }).toArray();
  }

  async findByAnnouncementId(announcementId: string): Promise<Report[]> {
    return await this.collection.find({ announcementId }).sort({ createdAt: -1 }).toArray();
  }

  async update(id: string, updateData: UpdateReportDto): Promise<Report | null> {
    try {
      const result = await this.collection.findOneAndUpdate(
        { _id: new ObjectId(id) },
        {
          $set: {
            ...updateData,
            updatedAt: new Date(),
          },
        },
        { returnDocument: 'after' },
      );
      return result as Report | null;
    } catch (error) {
      return null;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.collection.deleteOne({ _id: new ObjectId(id) });
    } catch (error) {}
  }

  async filterReports(filterDto: FilterReportDto): Promise<FilterReportResponse> {
    const filter: any = {};

    if (filterDto.type) filter.type = filterDto.type;
    if (filterDto.status) filter.status = filterDto.status;
    if (filterDto.priority) filter.priority = filterDto.priority;
    if (filterDto.userId) filter.userId = filterDto.userId;
    if (filterDto.announcementId) filter.announcementId = filterDto.announcementId;

    if (filterDto.createdAtFrom || filterDto.createdAtTo) {
      filter.createdAt = {};
      if (filterDto.createdAtFrom) filter.createdAt.$gte = new Date(filterDto.createdAtFrom);
      if (filterDto.createdAtTo) filter.createdAt.$lte = new Date(filterDto.createdAtTo);
    }

    const page = parseInt(filterDto.page as string) || 1;
    const limit = parseInt(filterDto.limit as string) || 10;
    const skip = (page - 1) * limit;

    const [reports, total] = await Promise.all([
      this.collection.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).toArray(),
      this.collection.countDocuments(filter),
    ]);

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
    const stats = await this.collection
      .aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            pending: { $sum: { $cond: [{ $eq: ['$status', 'PENDING'] }, 1, 0] } },
            inProgress: { $sum: { $cond: [{ $eq: ['$status', 'IN_PROGRESS'] }, 1, 0] } },
            resolved: { $sum: { $cond: [{ $eq: ['$status', 'RESOLVED'] }, 1, 0] } },
            rejected: { $sum: { $cond: [{ $eq: ['$status', 'REJECTED'] }, 1, 0] } },
            announcementReports: { $sum: { $cond: [{ $eq: ['$type', 'ANNOUNCEMENT'] }, 1, 0] } },
            technicalReports: { $sum: { $cond: [{ $eq: ['$type', 'TECHNICAL'] }, 1, 0] } },
          },
        },
      ])
      .toArray();

    return (
      stats[0] || {
        total: 0,
        pending: 0,
        inProgress: 0,
        resolved: 0,
        rejected: 0,
        announcementReports: 0,
        technicalReports: 0,
      }
    );
  }
}
