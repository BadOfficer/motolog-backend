import { Module } from '@nestjs/common';
import { ServiceLogsService } from './service-logs.service';
import { ServiceLogsController } from './service-logs.controller';

@Module({
  controllers: [ServiceLogsController],
  providers: [ServiceLogsService],
})
export class ServiceLogsModule {}
