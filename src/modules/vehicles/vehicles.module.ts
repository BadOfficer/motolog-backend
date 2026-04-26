import { Module } from '@nestjs/common';
import { VehiclesService } from './vehicles.service';
import { VehiclesController } from './vehicles.controller';
import { HttpModule } from '@nestjs/axios';
import { VehiclesMakesModule } from '../vehicles-makes/vehicles-makes.module';
import { VehiclesModelsModule } from '../vehicles-models/vehicles-models.module';

@Module({
  imports: [VehiclesMakesModule, VehiclesModelsModule],
  controllers: [VehiclesController],
  providers: [VehiclesService],
  exports: [VehiclesService],
})
export class VehiclesModule {}
