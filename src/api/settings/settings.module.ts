import { Module } from '@nestjs/common';
import { SettingsController } from './controllers/settings.controller';
import { SettingsService } from './services/settings.service';
import { SettingsRepository } from './repository/settings.repository';
import { DatabaseModule } from '../../database/database.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VolunteerSettings } from './entities/volunteer-settings.entity';
import { AssociationSettings } from './entities/association-settings.entity';
@Module({
  imports: [
    DatabaseModule,
    TypeOrmModule.forFeature([VolunteerSettings, AssociationSettings]),
  ],
  controllers: [SettingsController],
  providers: [SettingsService, SettingsRepository],
  exports: [SettingsService],
})
export class SettingsModule { }
