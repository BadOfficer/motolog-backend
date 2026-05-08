import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { FilesService } from './files.service';
import { extname, normalize, posix } from 'path';
import { randomUUID } from 'crypto';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class FilesS3Service extends FilesService {
  private readonly logger = new Logger(FilesS3Service.name);
  private readonly bucket = process.env['S3_BUCKET_NAME']!;
  private readonly region = process.env['S3_REGION']!;
  private readonly accessKeyId =
    process.env['S3_ACCESS_KEY_ID'] ?? process.env['S3_ACCESS'] ?? '';
  private readonly secretAccessKey =
    process.env['S3_SECRET_ACCESS_KEY'] ?? process.env['S3_SECRET'] ?? '';

  constructor() {
    super();
    this.validateConfig();
  }

  private readonly s3Client = new S3Client({
    region: this.region,
    credentials: {
      accessKeyId: this.accessKeyId,
      secretAccessKey: this.secretAccessKey,
    },
  });

  async saveFile(
    file: Express.Multer.File,
    folder: string = 'common',
  ): Promise<string> {
    const key = this.createFileKey(file, folder);

    try {
      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: key,
          Body: file.buffer,
          ContentType: file.mimetype,
        }),
      );
    } catch (error) {
      this.logger.error(
        `S3 upload failed: ${this.getErrorMessage(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }

    return this.getPublicUrl(key);
  }

  saveFiles(files: Express.Multer.File[], folder?: string): Promise<string[]> {
    return Promise.all(files.map((file) => this.saveFile(file, folder)));
  }

  async removeFile(filepath: string): Promise<string> {
    const key = this.extractKeyFromUrl(filepath);

    try {
      await this.s3Client.send(
        new DeleteObjectCommand({
          Bucket: this.bucket,
          Key: key,
        }),
      );
    } catch (error) {
      this.logger.error(
        `S3 delete failed: ${this.getErrorMessage(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }

    return filepath;
  }

  async removeFiles(filepaths: string[]): Promise<string[]> {
    return Promise.all(filepaths.map((filepath) => this.removeFile(filepath)));
  }

  private createFileKey(file: Express.Multer.File, folder: string): string {
    const safeFolder = normalize(folder)
      .replace(/^(\.\.(\/|\\|$))+/, '')
      .replace(/\\/g, '/');

    const extension = extname(file.originalname);
    const filename = `${randomUUID()}${extension}`;

    return posix.join(safeFolder, filename);
  }

  private getPublicUrl(key: string): string {
    return `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`;
  }

  private extractKeyFromUrl(filepath: string): string {
    const publicBaseUrl = `https://${this.bucket}.s3.${this.region}.amazonaws.com/`;

    if (filepath.startsWith(publicBaseUrl)) {
      return filepath.replace(publicBaseUrl, '');
    }

    return filepath;
  }

  private validateConfig() {
    if (!this.bucket || !this.region || !this.accessKeyId || !this.secretAccessKey) {
      throw new Error(
        'S3 config is incomplete. Required: S3_BUCKET_NAME, S3_REGION and (S3_ACCESS_KEY_ID + S3_SECRET_ACCESS_KEY) or (S3_ACCESS + S3_SECRET).',
      );
    }

    const maybeSwapped =
      this.accessKeyId.includes('/') && this.secretAccessKey.startsWith('AKIA');

    if (maybeSwapped) {
      throw new Error(
        'S3 credentials look swapped. ACCESS_KEY_ID should usually start with AKIA/ASIA, secret key is a longer value.',
      );
    }
  }

  private getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }

    return 'Unknown S3 error';
  }
}
