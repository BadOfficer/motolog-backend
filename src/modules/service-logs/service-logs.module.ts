import { Module } from '@nestjs/common';
import { ServiceLogsService } from './service-logs.service';
import { ServiceLogsController } from './service-logs.controller';
import { VehiclesModule } from '../vehicles/vehicles.module';

@Module({
  imports: [VehiclesModule],
  controllers: [ServiceLogsController],
  providers: [ServiceLogsService],
})
export class ServiceLogsModule {}
