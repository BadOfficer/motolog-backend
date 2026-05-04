import { Injectable } from '@nestjs/common';
import { FilesService } from './files.service';
import { extname, join, normalize, resolve } from 'path';
import { mkdir, unlink, writeFile } from 'fs/promises';
import { randomUUID } from 'crypto';
import { existsSync } from 'fs';

@Injectable()
export class FilesLocalService extends FilesService {
  private readonly rootFolder = 'uploads';

  private getRootDir() {
    return resolve(process.cwd(), this.rootFolder);
  }

  constructor() {
    super();
  }

  async saveFile(
    file: Express.Multer.File,
    folder: string = 'common',
  ): Promise<string> {
    const safeFolder = normalize(folder).replace(/^(\.\.(\/|\\|$))+/, '');
    const uploadDir = join(this.getRootDir(), safeFolder);

    await mkdir(uploadDir, { recursive: true });

    const fileExt = extname(file.originalname);
    const filename = `${randomUUID()}${fileExt}`;
    const fullPath = join(uploadDir, filename);

    await writeFile(fullPath, file.buffer);

    return join(this.rootFolder, safeFolder, filename);
  }

  async saveFiles(files: Express.Multer.File[]): Promise<string[]> {
    return Promise.all(files.map((file) => this.saveFile(file)));
  }

  async removeFile(filepath: string): Promise<string> {
    const fullPath = resolve(process.cwd(), filepath);

    if (existsSync(fullPath)) {
      await unlink(fullPath);
    }

    return filepath;
  }

  async removeFiles(filepath: string[]): Promise<string[]> {
    return Promise.all(filepath.map((path) => this.removeFile(path)));
  }
}
