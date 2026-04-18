import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { VehiclesService } from './vehicles.service';
import { DecodeVinDto } from './dto/decode-vin.dto';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthUser } from '../auth/interfaces/auth-user.interface';

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
}
