import { Module } from '@nestjs/common';
import { VehiclesModelsService } from './vehicles-models.service';
import { VehiclesModelsController } from './vehicles-models.controller';
import { VehiclesMakesModule } from '../vehicles-makes/vehicles-makes.module';

@Module({
  imports: [VehiclesMakesModule],
  controllers: [VehiclesModelsController],
  providers: [VehiclesModelsService],
  exports: [VehiclesModelsService],
})
export class VehiclesModelsModule {}
