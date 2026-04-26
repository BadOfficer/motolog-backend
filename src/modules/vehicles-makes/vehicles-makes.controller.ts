import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { VehiclesMakesService } from './vehicles-makes.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateMakeDto } from './dto/create-make.dto';

@Controller('vehicles-makes')
export class VehiclesMakesController {
  constructor(private readonly vehiclesMakesService: VehiclesMakesService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async getAllMakes() {
    return this.vehiclesMakesService.getAll();
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async createMake(@Body() dto: CreateMakeDto) {
    return this.vehiclesMakesService.create(dto);
  }
}
