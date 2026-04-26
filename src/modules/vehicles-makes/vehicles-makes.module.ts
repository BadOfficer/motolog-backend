import { Module } from '@nestjs/common';
import { VehiclesMakesService } from './vehicles-makes.service';
import { VehiclesMakesController } from './vehicles-makes.controller';

@Module({
  controllers: [VehiclesMakesController],
  providers: [VehiclesMakesService],
  exports: [VehiclesMakesService],
})
export class VehiclesMakesModule {}
