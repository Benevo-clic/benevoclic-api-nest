import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from '../entities/notification.entity';
import { CreateNotificationDto } from '../dto/create-notification.dto';

@Injectable()
export class NotificationsRepository {
  constructor(
    @InjectRepository(Notification)
    private readonly repository: Repository<Notification>,
  ) {}

  async create(dto: CreateNotificationDto): Promise<Notification> {
    const notification = this.repository.create(dto);
    return this.repository.save(notification);
  }

  async findByRecipientId(recipientId: string): Promise<Notification[]> {
    return this.repository.find({
      where: { recipientId },
      order: { createdAt: 'DESC' },
    });
  }

  async findUnreadByRecipientId(recipientId: string): Promise<Notification[]> {
    return this.repository.find({
      where: { recipientId, isRead: false },
      order: { createdAt: 'DESC' },
    });
  }

  async countUnreadByRecipientId(recipientId: string): Promise<number> {
    return this.repository.count({
      where: { recipientId, isRead: false },
    });
  }

  async markAsRead(id: string): Promise<void> {
    await this.repository.update(id, { isRead: true });
  }

  async markAllAsReadByRecipientId(recipientId: string): Promise<void> {
    await this.repository.update({ recipientId, isRead: false }, { isRead: true });
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  async deleteAllByRecipientId(recipientId: string): Promise<void> {
    await this.repository.delete({ recipientId });
  }

  async findById(id: string): Promise<Notification | null> {
    return this.repository.findOne({ where: { id } });
  }
}
