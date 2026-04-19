import {
  Body,
  Controller,
  Delete,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ServiceLogsService } from './service-logs.service';
import { CreateLogDto } from './dto/create-log.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateLogDto } from './dto/update-log.dto';

@Controller('service-logs')
export class ServiceLogsController {
  constructor(private readonly serviceLogsService: ServiceLogsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async createLog(@Body() createLogDto: CreateLogDto) {
    return this.serviceLogsService.create(createLogDto);
  }

  @Patch('/:logId')
  @UseGuards(JwtAuthGuard)
  async updateLog(
    @Param('logId') logId: string,
    @Body() updateLogDto: UpdateLogDto,
  ) {
    return this.serviceLogsService.update(logId, updateLogDto);
  }

  @Delete('/:logId')
  @UseGuards(JwtAuthGuard)
  async deleteLog(@Param('logId') logId: string) {
    return this.serviceLogsService.delete(logId);
  }
}
