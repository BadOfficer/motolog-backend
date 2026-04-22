import { Controller } from '@nestjs/common';
import { ServiceLogsService } from './service-logs.service';

@Controller('service-logs')
export class ServiceLogsController {
  constructor(private readonly serviceLogsService: ServiceLogsService) {}
}
