// src/api/support/support.module.ts
import { Module } from '@nestjs/common';
import { SupportController } from './controllers/support.controller';
import { SupportService } from './services/support.service';
import { SupportRepository } from './repositories/support.repository';
import { DatabaseModule } from '../../database/database.module';
import { DiscordWebhookService } from '../../common/services/discord/discord-webhook.service';

@Module({
  imports: [DatabaseModule],
  controllers: [SupportController],
  providers: [SupportService, SupportRepository, DiscordWebhookService],
  exports: [SupportService],
})
export class SupportModule {}
