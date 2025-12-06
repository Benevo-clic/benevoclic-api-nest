import {
    Controller,
    Get,
    Patch,
    Delete,
    Param,
    UseGuards,
    Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationsService } from '../services/notifications.service';
import { AuthGuard } from '../../../guards/auth.guard';
import { Notification } from '../entities/notification.entity';

@ApiTags('Notifications')
@Controller('notifications')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class NotificationsController {
    constructor(private readonly notificationsService: NotificationsService) { }

    /**
     * Extract the correct recipientId based on user role
     * - ASSOCIATION: uses associationId
     * - VOLUNTEER: uses volunteerId
     */
    private getRecipientId(req: any): string {
        const user = req.user;
        if (!user) return '';

        // Check role to determine which ID to use
        if (user.role === 'ASSOCIATION' && user.associationId) {
            return user.associationId;
        }
        if (user.role === 'VOLUNTEER' && user.volunteerId) {
            return user.volunteerId;
        }
        // Fallback to userId if no specific role ID is found
        return user.userId || user.uid || '';
    }

    @Get()
    @ApiOperation({ summary: 'Get all notifications for current user' })
    async getNotifications(@Request() req: any): Promise<Notification[]> {
        const recipientId = this.getRecipientId(req);
        return this.notificationsService.findByRecipientId(recipientId);
    }

    @Get('unread')
    @ApiOperation({ summary: 'Get unread notifications for current user' })
    async getUnreadNotifications(@Request() req: any): Promise<Notification[]> {
        const recipientId = this.getRecipientId(req);
        return this.notificationsService.findUnreadByRecipientId(recipientId);
    }

    @Get('unread-count')
    @ApiOperation({ summary: 'Get unread notification count' })
    async getUnreadCount(@Request() req: any): Promise<{ count: number }> {
        const recipientId = this.getRecipientId(req);
        const count = await this.notificationsService.getUnreadCount(recipientId);
        return { count };
    }

    @Patch(':id/read')
    @ApiOperation({ summary: 'Mark a notification as read' })
    async markAsRead(
        @Param('id') id: string,
        @Request() req: any,
    ): Promise<{ success: boolean }> {
        const recipientId = this.getRecipientId(req);
        await this.notificationsService.markAsRead(id, recipientId);
        return { success: true };
    }

    @Patch('mark-all-read')
    @ApiOperation({ summary: 'Mark all notifications as read' })
    async markAllAsRead(@Request() req: any): Promise<{ success: boolean }> {
        const recipientId = this.getRecipientId(req);
        await this.notificationsService.markAllAsRead(recipientId);
        return { success: true };
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete a notification' })
    async deleteNotification(@Param('id') id: string): Promise<{ success: boolean }> {
        await this.notificationsService.delete(id);
        return { success: true };
    }

    @Delete()
    @ApiOperation({ summary: 'Delete all notifications for current user' })
    async deleteAllNotifications(@Request() req: any): Promise<{ success: boolean }> {
        const recipientId = this.getRecipientId(req);
        await this.notificationsService.deleteAll(recipientId);
        return { success: true };
    }
}

