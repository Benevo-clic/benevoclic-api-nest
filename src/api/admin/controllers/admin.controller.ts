import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { AdminService } from '../services/admin.service';
import { AuthGuard } from '../../../guards/auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Admin')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @Get(':adminId/check-approval-status')
  checkApprovalStatus(@Param('adminId') adminId: string) {
    return this.adminService.checkApprovalStatus(adminId);
  }
}
