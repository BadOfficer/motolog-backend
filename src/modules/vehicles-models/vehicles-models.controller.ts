import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { VehiclesModelsService } from './vehicles-models.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('vehicles-models')
export class VehiclesModelsController {
  constructor(private readonly vehiclesModelsService: VehiclesModelsService) {}

  @Get('/:makeId')
  @UseGuards(JwtAuthGuard)
  async getModelsByMakeId(@Param('makeId') makeId: string) {
    return this.vehiclesModelsService.getModelsByMakeId(makeId);
  }
}
