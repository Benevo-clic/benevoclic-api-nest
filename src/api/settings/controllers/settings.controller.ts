import {
  Body,
  Controller,
  Get,
  Logger,
  Param,
  Put,
  Request,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../../../guards/auth.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../../common/enums/roles.enum';
import { SettingsService } from '../services/settings.service';
import { UpdateVolunteerSettingsDto } from '../dto/update-volunteer-settings.dto';
import { UpdateAssociationSettingsDto } from '../dto/update-association-settings.dto';
import { VolunteerSettings } from '../entities/volunteer-settings.entity';
import { AssociationSettings } from '../entities/association-settings.entity';
import { Public } from '../../../common/decorators/public.decorator';

@ApiTags('settings')
@Controller('settings')
@UseGuards(AuthGuard)
@ApiBearerAuth()
@UsePipes(
  new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true, // bloque les champs non listés dans le DTO (ex: associationId)
  }),
)
export class SettingsController {
  private readonly logger = new Logger(SettingsController.name);

  constructor(private readonly service: SettingsService) {}

  @Get('volunteer')
  @Roles(UserRole.VOLUNTEER)
  @ApiOperation({ summary: 'Récupérer les paramètres du volontaire' })
  @ApiResponse({ status: 200, description: 'OK', type: VolunteerSettings })
  async getVolunteerSettings(@Request() req: any): Promise<VolunteerSettings> {
    const userId = req.user.uid;
    this.logger.log(`GET volunteer settings: ${userId}`);
    return this.service.getOrCreateVolunteerSettings(userId);
  }

  @Public()
  @Get('volunteer/:volunteerId')
  @ApiOperation({ summary: 'Récupérer les paramètres publics du volontaire' })
  @ApiResponse({ status: 200, description: 'OK', type: VolunteerSettings })
  async getPublicVolunteerSettings(
    @Param('volunteerId') volunteerId: string,
  ): Promise<VolunteerSettings> {
    this.logger.log(`GET public volunteer settings: ${volunteerId}`);
    return this.service.getVolunteerSettings(volunteerId);
  }

  @Public()
  @Get('association/:associationId')
  @ApiOperation({ summary: "Récupérer les paramètres publics de l'association" })
  @ApiResponse({ status: 200, description: 'OK', type: AssociationSettings })
  async getPublicAssociationSettings(
    @Param('associationId') associationId: string,
  ): Promise<AssociationSettings> {
    this.logger.log(`GET public association settings: ${associationId}`);
    return this.service.getAssociationSettings(associationId);
  }

  @Put('volunteer')
  @Roles(UserRole.VOLUNTEER)
  @ApiOperation({ summary: 'Mettre à jour les paramètres du volontaire' })
  @ApiResponse({ status: 200, description: 'OK', type: VolunteerSettings })
  async updateVolunteerSettings(
    @Request() req: any,
    @Body() dto: UpdateVolunteerSettingsDto,
  ): Promise<VolunteerSettings> {
    const userId = req.user.uid;
    this.logger.log(`PUT volunteer settings: ${userId}`);
    return this.service.updateVolunteerSettings(userId, dto);
  }

  @Get('association')
  @Roles(UserRole.ASSOCIATION)
  @ApiOperation({ summary: "Récupérer les paramètres de l'association" })
  @ApiResponse({ status: 200, description: 'OK', type: AssociationSettings })
  async getAssociationSettings(@Request() req: any): Promise<AssociationSettings> {
    const associationId = req.user.uid;
    this.logger.log(`GET association settings: ${associationId}`);
    return this.service.getOrCreateAssociationSettings(associationId);
  }

  @Put('association')
  @Roles(UserRole.ASSOCIATION)
  @ApiOperation({ summary: "Mettre à jour les paramètres de l'association" })
  @ApiResponse({ status: 200, description: 'OK', type: AssociationSettings })
  async updateAssociationSettings(
    @Request() req: any,
    @Body() dto: UpdateAssociationSettingsDto,
  ): Promise<AssociationSettings> {
    const associationId = req.user.uid;
    this.logger.log(`PUT association settings: ${associationId}`);
    return this.service.updateAssociationSettings(associationId, dto);
  }
}
