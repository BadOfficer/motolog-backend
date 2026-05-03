import { Module } from '@nestjs/common';
import { FilesService } from './files.service';
import { FilesLocalService } from './files-local.service';

@Module({
  providers: [
    {
      provide: FilesService,
      useClass: FilesLocalService,
    },
  ],
  exports: [FilesService],
})
export class FilesModule {}
