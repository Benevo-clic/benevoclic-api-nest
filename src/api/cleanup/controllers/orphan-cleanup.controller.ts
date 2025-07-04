import { Controller, Post, Get, Param, UseGuards } from '@nestjs/common';

import { OrphanCleanupService } from '../../../common/services/orphan-cleanup.service';
import { AuthGuard } from '../../../guards/auth.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../../common/enums/roles.enum';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('orphan-cleanup')
export class OrphanCleanupController {
  constructor(private readonly orphanCleanupService: OrphanCleanupService) {}

  @Post('manual')
  @UseGuards(AuthGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  async manualCleanup() {
    return this.orphanCleanupService.manualCleanup();
  }

  @Get('status')
  getStatus() {
    return { message: 'Orphan cleanup service is running.' };
  }

  @Get(':volunteerId')
  @UseGuards(AuthGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  async cleanupByVolunteerId(@Param('volunteerId') volunteerId: string) {
    return this.orphanCleanupService.cleanupVolunteer(volunteerId);
  }
}
