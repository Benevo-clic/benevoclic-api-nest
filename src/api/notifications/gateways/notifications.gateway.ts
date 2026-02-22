import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { Notification } from '../entities/notification.entity';

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
  namespace: '/notifications',
})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationsGateway.name);

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('join')
  handleJoin(client: Socket, data: { recipientId: string }) {
    if (data.recipientId) {
      client.join(data.recipientId);
      this.logger.log(`Client ${client.id} joined room: ${data.recipientId}`);
    }
  }

  @SubscribeMessage('leave')
  handleLeave(client: Socket, data: { recipientId: string }) {
    if (data.recipientId) {
      client.leave(data.recipientId);
      this.logger.log(`Client ${client.id} left room: ${data.recipientId}`);
    }
  }

  sendNotification(recipientId: string, notification: Notification) {
    this.server.to(recipientId).emit('notification', notification);
    this.logger.log(`Notification sent to ${recipientId}: ${notification.type}`);
  }

  sendUnreadCount(recipientId: string, count: number) {
    this.server.to(recipientId).emit('unreadCount', { count });
  }
}
