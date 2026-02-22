import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { NotificationsRepository } from '../repositories/notifications.repository';
import { NotificationsGateway } from '../gateways/notifications.gateway';
import { CreateNotificationDto } from '../dto/create-notification.dto';
import { Notification } from '../entities/notification.entity';
import { NotificationType, RecipientType } from '../interfaces/notification.interface';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private readonly repository: NotificationsRepository,
    private readonly gateway: NotificationsGateway,
  ) {}

  async create(dto: CreateNotificationDto): Promise<Notification> {
    const notification = await this.repository.create(dto);

    // Send real-time notification via WebSocket
    this.gateway.sendNotification(dto.recipientId, notification);

    // Update unread count
    const unreadCount = await this.repository.countUnreadByRecipientId(dto.recipientId);
    this.gateway.sendUnreadCount(dto.recipientId, unreadCount);

    this.logger.log(`Notification created for ${dto.recipientId}: ${dto.type}`);
    return notification;
  }

  async findByRecipientId(recipientId: string): Promise<Notification[]> {
    return this.repository.findByRecipientId(recipientId);
  }

  async findUnreadByRecipientId(recipientId: string): Promise<Notification[]> {
    return this.repository.findUnreadByRecipientId(recipientId);
  }

  async getUnreadCount(recipientId: string): Promise<number> {
    return this.repository.countUnreadByRecipientId(recipientId);
  }

  async markAsRead(id: string, recipientId: string): Promise<void> {
    const notification = await this.repository.findById(id);
    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    await this.repository.markAsRead(id);

    // Update unread count via WebSocket
    const unreadCount = await this.repository.countUnreadByRecipientId(recipientId);
    this.gateway.sendUnreadCount(recipientId, unreadCount);
  }

  async markAllAsRead(recipientId: string): Promise<void> {
    await this.repository.markAllAsReadByRecipientId(recipientId);
    this.gateway.sendUnreadCount(recipientId, 0);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  async deleteAll(recipientId: string): Promise<void> {
    await this.repository.deleteAllByRecipientId(recipientId);
    this.gateway.sendUnreadCount(recipientId, 0);
  }

  // Helper methods for creating specific notification types
  async notifyAssociationOfVolunteerRequest(
    associationId: string,
    eventName: string,
    eventId: string,
    volunteerName: string,
  ): Promise<Notification> {
    return this.create({
      recipientId: associationId,
      recipientType: RecipientType.ASSOCIATION,
      type: NotificationType.VOLUNTEER_REQUEST,
      message: `${volunteerName} souhaite être bénévole pour "${eventName}"`,
      redirectUrl: `/association/events/association/requests`,
      entityId: eventId,
      entityName: eventName,
    });
  }

  async notifyAssociationOfParticipantRequest(
    associationId: string,
    eventName: string,
    eventId: string,
    participantName: string,
  ): Promise<Notification> {
    return this.create({
      recipientId: associationId,
      recipientType: RecipientType.ASSOCIATION,
      type: NotificationType.PARTICIPANT_REQUEST,
      message: `${participantName} souhaite participer à "${eventName}"`,
      redirectUrl: `/association/events/announcement/${eventId}`,
      entityId: eventId,
      entityName: eventName,
    });
  }

  async notifyAssociationOfMembershipRequest(
    associationId: string,
    volunteerName: string,
    volunteerId: string,
  ): Promise<Notification> {
    return this.create({
      recipientId: associationId,
      recipientType: RecipientType.ASSOCIATION,
      type: NotificationType.MEMBERSHIP_REQUEST,
      message: `${volunteerName} souhaite rejoindre votre association`,
      redirectUrl: `/association/account/volunteers`,
      entityId: volunteerId,
      entityName: volunteerName,
    });
  }

  async notifyVolunteerOfAcceptance(
    volunteerId: string,
    eventName: string,
    eventId: string,
    associationName: string,
  ): Promise<Notification> {
    return this.create({
      recipientId: volunteerId,
      recipientType: RecipientType.VOLUNTEER,
      type: NotificationType.VOLUNTEER_ACCEPTED,
      message: `Votre demande de bénévolat pour "${eventName}" a été acceptée par ${associationName}`,
      redirectUrl: `/volunteer/events/announcement/${eventId}`,
      entityId: eventId,
      entityName: eventName,
    });
  }

  async notifyVolunteerOfRejection(
    volunteerId: string,
    eventName: string,
    eventId: string,
    associationName: string,
  ): Promise<Notification> {
    return this.create({
      recipientId: volunteerId,
      recipientType: RecipientType.VOLUNTEER,
      type: NotificationType.VOLUNTEER_REJECTED,
      message: `Votre demande de bénévolat pour "${eventName}" a été refusée par ${associationName}`,
      redirectUrl: `/volunteer/activity/missions`,
      entityId: eventId,
      entityName: eventName,
    });
  }

  async notifyVolunteerOfMembershipAcceptance(
    volunteerId: string,
    associationName: string,
    associationId: string,
  ): Promise<Notification> {
    return this.create({
      recipientId: volunteerId,
      recipientType: RecipientType.VOLUNTEER,
      type: NotificationType.MEMBERSHIP_ACCEPTED,
      message: `Vous êtes maintenant membre de ${associationName}`,
      redirectUrl: `/volunteer/account/associations`,
      entityId: associationId,
      entityName: associationName,
    });
  }

  async notifyVolunteerOfMembershipRequestRejection(
    volunteerId: string,
    associationId: string,
    associationName: string,
  ): Promise<Notification> {
    return this.create({
      recipientId: volunteerId,
      recipientType: RecipientType.VOLUNTEER,
      type: NotificationType.MEMBERSHIP_REJECTED,
      message: `Votre demande d'adhésion à ${associationName} a été refusée`,
      redirectUrl: `/volunteer/account/associations`,
      entityId: associationId,
      entityName: associationName,
    });
  }
}
