import { Module } from '@nestjs/common';
import { SupportController } from './controllers/support.controller';
import { SupportService } from './services/support.service';
import { SupportRepository } from './repositories/support.repository';
import { DatabaseModule } from '../../database/database.module';
import { DiscordWebhookService } from '../../common/services/discord/discord-webhook.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Report } from './entities/report.entity';
@Module({
  imports: [DatabaseModule, TypeOrmModule.forFeature([Report])],
  controllers: [SupportController],
  providers: [SupportService, SupportRepository, DiscordWebhookService],
  exports: [SupportService],
})
export class SupportModule { }
