import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { AdminService } from '../services/admin.service';
import { AuthGuard } from '../../../guards/auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../../common/enums/roles.enum';

@ApiTags('Admin')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get(':adminId/check-approval-status')
  @UseGuards(AuthGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  checkApprovalStatus(@Param('adminId') adminId: string) {
    return this.adminService.checkApprovalStatus(adminId);
  }
}
