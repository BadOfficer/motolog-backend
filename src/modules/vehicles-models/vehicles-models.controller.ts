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
import { VehiclesModelsService } from './vehicles-models.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateModelDto } from './dto/create-model.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from 'src/generated/prisma/enums';
import { RolesGuard } from '../auth/guards/roles.guard';

@Controller('vehicles-models')
export class VehiclesModelsController {
  constructor(private readonly vehiclesModelsService: VehiclesModelsService) {}

  @Get('/:makeId')
  @UseGuards(JwtAuthGuard)
  async getModelsByMakeId(
    @Param('makeId') makeId: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
    @Query('query') query: string = '',
  ) {
    return this.vehiclesModelsService.getModelsByMakeId(
      makeId,
      +page,
      +limit,
      query,
    );
  }

  @Post()
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async createModel(@Body() dto: CreateModelDto) {
    return this.vehiclesModelsService.create(dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async deleteModel(@Param('id') id: string) {
    return this.vehiclesModelsService.delete(id);
  }
}
