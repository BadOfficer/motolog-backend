import { Module } from '@nestjs/common';
import { FilesService } from './files.service';
import { FilesS3Service } from './files-s3.service';

@Module({
  providers: [
    {
      provide: FilesService,
      useClass: FilesS3Service,
    },
  ],
  exports: [FilesService],
})
export class FilesModule {}
