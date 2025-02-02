import { Module } from '@nestjs/common';
import { AssociationService } from './association.service';
import { AssociationController } from './association.controller';
import { AssociationRepository } from './association.repository';
import { ImageUploadService } from './services/image-upload.service';
import { DatabaseModule } from '../../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [AssociationController],
  providers: [AssociationService, AssociationRepository, ImageUploadService],
})
export class AssociationModule {}
