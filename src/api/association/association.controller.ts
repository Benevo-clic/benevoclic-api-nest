import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  NotFoundException,
  Res,
} from '@nestjs/common';
import { AssociationService } from './association.service';
import { CreateAssociationDto } from './dto/create-association.dto';
import { UpdateAssociationDto } from './dto/update-association.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '../../guards/auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums/roles.enum';
import { ImageUploadService } from './services/image-upload.service';
import { Response } from 'express';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Association } from './entities/association.entity';

@Controller('association')
export class AssociationController {
  constructor(
    private readonly associationService: AssociationService,
    private readonly imageUploadService: ImageUploadService,
  ) {}

  @UseGuards(AuthGuard)
  @Roles(UserRole.ASSOCIATION)
  @ApiBearerAuth()
  @Post()
  create(@Body() createAssociationDto: CreateAssociationDto) {
    return this.associationService.create(createAssociationDto);
  }

  @UseGuards(AuthGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @Get()
  findAll(): Promise<Association[]> {
    return this.associationService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.associationService.findOne(id);
  }

  @UseGuards(AuthGuard)
  @Roles(UserRole.ASSOCIATION)
  @ApiBearerAuth()
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAssociationDto: UpdateAssociationDto) {
    return this.associationService.update(id, updateAssociationDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.associationService.remove(+id);
  }

  @Post(':id/profile-image')
  @UseGuards(AuthGuard)
  @Roles(UserRole.ASSOCIATION)
  @UseInterceptors(FileInterceptor('image'))
  async uploadProfileImage(@Param('id') id: string, @UploadedFile() file: Express.Multer.File) {
    const profileImage = await this.imageUploadService.uploadProfileImage(file, id);
    await this.associationService.updateProfileImage(id, profileImage);
    return profileImage;
  }

  @Get(':id/profile-image')
  async getProfileImage(@Param('id') id: string, @Res() res: Response) {
    const association = await this.associationService.findOne(id);
    if (!association?.profileImage) {
      throw new NotFoundException('Image not found');
    }

    const imageBuffer = await this.imageUploadService.getProfileImage(
      association.profileImage.filename,
    );
    res.set({
      'Content-Type': association.profileImage.contentType,
      'Content-Length': imageBuffer.length,
    });
    res.end(imageBuffer);
  }
}
