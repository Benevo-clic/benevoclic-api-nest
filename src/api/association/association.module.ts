import { Module } from '@nestjs/common';
import { AssociationService } from './services/association.service';
import { AssociationController } from './controllers/association.controller';
import { AssociationRepository } from './repository/association.repository';
import { DatabaseModule } from '../../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [AssociationController],
  providers: [AssociationService, AssociationRepository],
})
export class AssociationModule {}
