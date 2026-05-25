import {
  Body,
  Controller,
  Delete,
  FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
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

@Controller('service-logs')
export class ServiceLogsController {
  constructor(private readonly serviceLogsService: ServiceLogsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FilesInterceptor('media'))
  async createLog(
    @Body() dto: CreateServiceLogDto,
    @UploadedFiles(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({
            maxSize: 10 * 1024 * 1024,
          }),
          new FileTypeValidator({
            fileType: /^(image\/jpeg|image\/png|image\/webp|application\/pdf)$/,
          }),
        ],
        fileIsRequired: false,
      }),
    )
    files: Express.Multer.File[],
  ) {
    return this.serviceLogsService.create(dto, files);
  }

  @Patch('/:id/correct')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FilesInterceptor('media'))
  async correctLog(
    @Param('id') id: string,
    @Body() dto: CorrectServiceLogDto,
    @UploadedFiles(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({
            maxSize: 10 * 1024 * 1024,
          }),
          new FileTypeValidator({
            fileType: /^(image\/jpeg|image\/png|image\/webp|application\/pdf)$/,
          }),
        ],
        fileIsRequired: false,
      }),
    )
    files: Express.Multer.File[],
  ) {
    return this.serviceLogsService.correct(id, dto, files);
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

  @Get('for-vehicle/:vehicleId')
  async getByBehicleId(
    @Param('vehicleId') vehicleId: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
  ) {
    return this.serviceLogsService.findByVehicleId(vehicleId, +page, +limit);
  }

  @Get('/:id')
  @UseGuards(JwtAuthGuard)
  async getById(@Param('id') id: string) {
    return this.serviceLogsService.findById(id);
  }
}
