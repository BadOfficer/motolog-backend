import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateServiceLogDto } from './dto/create-service-log.dto';
import { CorrectServiceLogDto } from './dto/correct-service-log.dto';
import { ServiceLogItemDto } from './dto/service-log-item.dto';
import { FilesService } from '../files/files.service';

@Injectable()
export class ServiceLogsService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly filesService: FilesService,
  ) {}

  private calculateTotal(items: ServiceLogItemDto[], subTotal: number) {
    const partsTotal = items.reduce(
      (sum, part) => sum + part.unitPrice * part.quantity,
      0,
    );

    return partsTotal + subTotal;
  }

  private async validateRecordMileage(
    vehicleId: string,
    newMileage: number,
    date: Date,
  ) {
    const prevRecord = await this.prismaService.serviceLog.findFirst({
      where: {
        vehicleId,
        status: 'ACTIVE',
        date: {
          lt: date,
        },
      },
      orderBy: {
        date: 'desc',
      },
    });

    const nextRecord = await this.prismaService.serviceLog.findFirst({
      where: {
        vehicleId,
        status: 'ACTIVE',
        date: {
          gt: date,
        },
      },
      orderBy: {
        date: 'asc',
      },
    });

    const warnings: string[] = [];

    if (prevRecord && prevRecord.mileage >= newMileage) {
      warnings.push(
        `Mileage is lower than previous record: ${prevRecord.mileage}`,
      );
    }

    if (nextRecord && nextRecord.mileage <= newMileage) {
      warnings.push(
        `Mileage is higher than next record: ${nextRecord.mileage}`,
      );
    }

    return {
      isValid: warnings.length === 0,
      warnings,
      nextRecord,
      prevRecord,
    };
  }

  async findById(id: string) {
    const existLog = await this.prismaService.serviceLog.findUnique({
      where: {
        id,
      },
    });

    if (!existLog) {
      throw new NotFoundException(`Service log with ID - ${id} not found`);
    }

    return existLog;
  }

  async create(dto: CreateServiceLogDto) {
    const { isValid, warnings } = await this.validateRecordMileage(
      dto.vehicleId,
      dto.mileage,
      dto.date,
    );

    const items = dto?.items || [];

    const total = this.calculateTotal(items, dto.subTotal);

    return this.prismaService.$transaction(async (tx) => {
      const newLog = await tx.serviceLog.create({
        data: {
          ...dto,
          total,
          date: dto.date,
          mileageWarnings: warnings,
          isMileageValid: isValid,
          items: {
            createMany: {
              data: items,
            },
          },
        },
      });

      const vehicle = await this.prismaService.vehicle.findUnique({
        where: {
          id: dto.vehicleId,
        },
      });

      if (!vehicle) {
        throw new NotFoundException(`Vehicle not found`);
      }

      if (newLog.mileage > vehicle.currentMileage) {
        await this.prismaService.vehicle.update({
          where: {
            id: dto.vehicleId,
          },
          data: {
            currentMileage: newLog.mileage,
            lastMileageUpdate: new Date(),
          },
        });
      }

      return newLog;
    });
  }

  async correct(id: string, dto: CorrectServiceLogDto) {
    const log = await this.findById(id);

    switch (log.status) {
      case 'CORRECTED':
        throw new BadRequestException(
          `You cannot correct corrected log before`,
        );
      case 'DELETED':
        throw new BadRequestException(`You cannot correct deleted log`);
    }

    const { nextRecord, isValid, warnings } = await this.validateRecordMileage(
      log.vehicleId,
      dto.mileage,
      dto.date,
    );

    const items = dto?.items ?? [];

    const total = this.calculateTotal(items, dto.subTotal);

    return this.prismaService.$transaction(async (tx) => {
      const newLog = await tx.serviceLog.create({
        data: {
          ...dto,
          vehicleId: log.vehicleId,
          total,
          isMileageValid: isValid,
          mileageWarnings: warnings,
          date: dto.date,
          status: 'ACTIVE',
          items: {
            createMany: {
              data: items,
            },
          },
        },
      });

      await tx.serviceLog.update({
        where: {
          id: id,
        },
        data: {
          correctedLogId: newLog.id,
          status: 'CORRECTED',
          correctReason: dto.correctReason,
        },
      });

      if (!nextRecord) {
        await tx.vehicle.update({
          where: {
            id: log.vehicleId,
          },
          data: {
            currentMileage: dto.mileage,
            lastMileageUpdate: new Date(),
          },
        });
      }

      return newLog;
    });
  }

  async updateMedia(
    id: string,
    files: Express.Multer.File[] = [],
    idsToDelete: string[] = [],
  ) {
    const mediaToDelete = await this.prismaService.serviceLogMedia.findMany({
      where: {
        id: { in: idsToDelete },
        serviceLogId: id,
      },
    });

    const savedFiles =
      files.length > 0 ? await this.filesService.saveFiles(files) : [];

    try {
      const urlsToDelete = await this.prismaService.$transaction(async (tx) => {
        if (idsToDelete.length > 0) {
          await tx.serviceLogMedia.deleteMany({
            where: {
              id: { in: idsToDelete },
              serviceLogId: id,
            },
          });
        }

        if (savedFiles.length > 0) {
          await tx.serviceLogMedia.createMany({
            data: savedFiles.map((url) => ({
              serviceLogId: id,
              url,
            })),
          });
        }

        return mediaToDelete.map((item) => item.url);
      });

      await this.filesService.removeFiles(urlsToDelete);

      return this.prismaService.serviceLogMedia.findMany({
        where: { serviceLogId: id },
        orderBy: { createdAt: 'desc' },
      });
    } catch (error) {
      if (savedFiles.length > 0) {
        await this.filesService.removeFiles(savedFiles);
      }

      throw error;
    }
  }

  async delete(id: string) {
    await this.findById(id);

    return this.prismaService.serviceLog.delete({
      where: {
        id,
      },
    });
  }
}
