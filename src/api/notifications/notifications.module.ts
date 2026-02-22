import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from './entities/notification.entity';
import { NotificationsRepository } from './repositories/notifications.repository';
import { NotificationsService } from './services/notifications.service';
import { NotificationsController } from './controllers/notifications.controller';
import { NotificationsGateway } from './gateways/notifications.gateway';
import { UserModule } from '../user/user.module';

@Module({
  imports: [TypeOrmModule.forFeature([Notification]), forwardRef(() => UserModule)],
  controllers: [NotificationsController],
  providers: [NotificationsRepository, NotificationsService, NotificationsGateway],
  exports: [NotificationsService],
})
export class NotificationsModule {}
