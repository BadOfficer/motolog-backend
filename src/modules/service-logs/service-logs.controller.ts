import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ServiceLogsService } from './service-logs.service';
import { CreateServiceLogDto } from './dto/create-service-log.dto';
import { CorrectServiceLogDto } from './dto/correct-service-log.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FilesInterceptor } from '@nestjs/platform-express';
import { UpdateMediaDto } from './dto/update-media.dto';

@Controller('service-logs')
export class ServiceLogsController {
  constructor(private readonly serviceLogsService: ServiceLogsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async createLog(@Body() dto: CreateServiceLogDto) {
    return this.serviceLogsService.create(dto);
  }

  @Patch('/:id/correct')
  @UseGuards(JwtAuthGuard)
  async correctLog(@Param('id') id: string, @Body() dto: CorrectServiceLogDto) {
    return this.serviceLogsService.correct(id, dto);
  }

  @Patch(':id/update-media/:ownerId')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FilesInterceptor('media'))
  async updateLogMedia(
    @Param('id') id: string,
    @Body() dto: UpdateMediaDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.serviceLogsService.updateMedia(id, files, dto);
  }

  @Get('/for-vehicle/:vehicleId')
  @UseGuards(JwtAuthGuard)
  async getLogsByVehicleId(@Param('vehicleId') vehicleId: string) {
    return this.serviceLogsService.getByVehicleId(vehicleId);
  }

  @Delete('/:id')
  @UseGuards(JwtAuthGuard)
  async deleteLog(@Param('id') id: string) {
    return this.serviceLogsService.delete(id);
  }
}
