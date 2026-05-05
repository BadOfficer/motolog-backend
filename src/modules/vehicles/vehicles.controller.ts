import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { VehiclesService } from './vehicles.service';
import { DecodeVinDto } from './dto/decode-vin.dto';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthUser } from '../auth/interfaces/auth-user.interface';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('vehicles')
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) {}

  @Get('/decode-vin')
  @UseGuards(JwtAuthGuard)
  async decodeVin(@Body() vinBody: DecodeVinDto) {
    return this.vehiclesService.decodeVin(vinBody.vin);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async createVehicle(
    @Body() createVehicleDto: CreateVehicleDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.vehiclesService.createVehicle(createVehicleDto, user.id);
  }

  @Get('/:id')
  @UseGuards(JwtAuthGuard)
  async getVehicleById(@Param('id') id: string) {
    return this.vehiclesService.findById(id);
  }

  @Patch(':id/update-mileage')
  @UseGuards(JwtAuthGuard)
  async updateVehicleMileage(
    @Param('id') id: string,
    @Query('mileage') mileage: string,
  ) {
    const { currentMileage, ...dto } = new UpdateVehicleDto();

    return this.vehiclesService.update(id, {
      ...dto,
      currentMileage: +mileage,
    });
  }

  @Patch(':id/update-image')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('image'))
  async updateImage(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.vehiclesService.updateImage(id, file);
  }

  @Patch('/:id')
  @UseGuards(JwtAuthGuard)
  async updateVehicle(@Param('id') id: string, @Body() dto: UpdateVehicleDto) {
    return this.vehiclesService.update(id, dto);
  }

  @Delete(':id/remove-image')
  @UseGuards(JwtAuthGuard)
  async removeImage(@Param('id') id: string) {
    return this.vehiclesService.removeImage(id);
  }
}
