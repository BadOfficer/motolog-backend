import { Module } from '@nestjs/common';
import { ServiceLogsService } from './service-logs.service';
import { ServiceLogsController } from './service-logs.controller';
import { FilesModule } from '../files/files.module';

@Module({
  imports: [FilesModule],
  controllers: [ServiceLogsController],
  providers: [ServiceLogsService],
})
export class ServiceLogsModule {}
