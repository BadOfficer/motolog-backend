import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { VehiclesMakesService } from './vehicles-makes.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateMakeDto } from './dto/create-make.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from 'src/generated/prisma/enums';
import { RolesGuard } from '../auth/guards/roles.guard';

@Controller('vehicles-makes')
export class VehiclesMakesController {
  constructor(private readonly vehiclesMakesService: VehiclesMakesService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async getAllMakes(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
    @Query('query') query: string = '',
  ) {
    return this.vehiclesMakesService.getAll(+page, +limit, query);
  }

  @Post()
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async createMake(@Body() dto: CreateMakeDto) {
    return this.vehiclesMakesService.create(dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async deleteMake(@Param('id') id: string) {
    return this.vehiclesMakesService.delete(id);
  }
}
