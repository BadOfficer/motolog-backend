import { Injectable } from '@nestjs/common';

@Injectable()
export abstract class FilesService {
  abstract saveFile(
    file: Express.Multer.File,
    folder?: string,
  ): Promise<string>;
  abstract saveFiles(
    files: Express.Multer.File[],
    folder?: string,
  ): Promise<string[]>;
  abstract removeFile(filepath: string): Promise<string>;
}
