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
import { PaginatedResponse } from 'src/interfaces/PaginatedResponse.interface';
import { ServiceLog } from 'src/generated/prisma/client';

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
    excludeRecordId?: string,
  ) {
    const dayStart = new Date(date);
    dayStart.setUTCHours(0, 0, 0, 0);

    const dayEnd = new Date(date);
    dayEnd.setUTCHours(23, 59, 59, 999);

    const sameDayRecords = await this.prismaService.serviceLog.findMany({
      where: {
        vehicleId,
        status: 'ACTIVE',
        date: {
          gte: dayStart,
          lte: dayEnd,
        },
        ...(excludeRecordId ? { id: { not: excludeRecordId } } : {}),
      },
    });

    if (sameDayRecords.some((r) => r.mileage !== newMileage)) {
      throw new BadRequestException(
        'Cannot add a record with a different mileage on the same date',
      );
    }

    const prevRecord = await this.prismaService.serviceLog.findFirst({
      where: {
        vehicleId,
        status: 'ACTIVE',
        date: {
          lt: dayStart,
        },
        ...(excludeRecordId ? { id: { not: excludeRecordId } } : {}),
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
          gt: dayEnd,
        },
        ...(excludeRecordId ? { id: { not: excludeRecordId } } : {}),
      },
      orderBy: {
        date: 'asc',
      },
    });

    const warnings: string[] = [];

    if (prevRecord && prevRecord.mileage > newMileage) {
      warnings.push(
        `Mileage is lower than previous record: ${prevRecord.mileage}`,
      );
    }

    if (nextRecord && nextRecord.mileage < newMileage) {
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
      include: {
        items: true,
        category: {
          select: {
            title: true,
            isSystem: true,
          },
        },
        media: true,
      },
    });

    if (!existLog) {
      throw new NotFoundException(`Service log with ID - ${id} not found`);
    }

    return existLog;
  }

  async create(dto: CreateServiceLogDto, files: Express.Multer.File[] = []) {
    const { isValid, warnings } = await this.validateRecordMileage(
      dto.vehicleId,
      dto.mileage,
      dto.date,
    );

    const items = dto?.items || [];

    const total = this.calculateTotal(items, dto.subTotal);
    const savedFiles =
      files.length > 0
        ? await this.filesService.saveFiles(files, 'service-logs')
        : [];

    try {
      return await this.prismaService.$transaction(async (tx) => {
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

        if (savedFiles.length > 0) {
          await tx.serviceLogMedia.createMany({
            data: savedFiles.map((url) => ({
              serviceLogId: newLog.id,
              url,
            })),
          });
        }

        const vehicle = await tx.vehicle.findUnique({
          where: {
            id: dto.vehicleId,
          },
        });

        if (!vehicle) {
          throw new NotFoundException(`Vehicle not found`);
        }

        if (newLog.mileage > vehicle.currentMileage) {
          await tx.vehicle.update({
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
    } catch (error) {
      if (savedFiles.length > 0) {
        await this.filesService.removeFiles(savedFiles);
      }

      throw error;
    }
  }

  async correct(
    id: string,
    dto: CorrectServiceLogDto,
    files: Express.Multer.File[] = [],
  ) {
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
      id,
    );
    const { idsToDelete = [], correctReason: _correctReason, ...payload } = dto;
    const inheritedMediaIds = new Set(log.media.map((media) => media.id));

    if (idsToDelete.some((mediaId) => !inheritedMediaIds.has(mediaId))) {
      throw new BadRequestException(
        'Some media idsToDelete are not attached to corrected record',
      );
    }

    const items =
      dto.items !== undefined
        ? dto.items
        : log.items.map((item) => ({
            name: item.name,
            brand: item.brand ?? undefined,
            description: item.description ?? undefined,
            partNumber: item.partNumber ?? undefined,
            unitPrice: Number(item.unitPrice),
            quantity: item.quantity,
          }));

    const total = this.calculateTotal(items, dto.subTotal);
    const inheritedMediaUrls = log.media
      .filter((media) => !idsToDelete.includes(media.id))
      .map((media) => media.url);
    const savedFiles =
      files.length > 0
        ? await this.filesService.saveFiles(files, 'service-logs')
        : [];

    try {
      return await this.prismaService.$transaction(async (tx) => {
        const newLog = await tx.serviceLog.create({
          data: {
            ...payload,
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

        const nextMediaUrls = [...inheritedMediaUrls, ...savedFiles];

        if (nextMediaUrls.length > 0) {
          await tx.serviceLogMedia.createMany({
            data: nextMediaUrls.map((url) => ({
              serviceLogId: newLog.id,
              url,
            })),
          });
        }

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
    } catch (error) {
      if (savedFiles.length > 0) {
        await this.filesService.removeFiles(savedFiles);
      }

      throw error;
    }
  }

  async getByVehicleId(vehicleId: string) {
    return this.prismaService.serviceLog.findMany({
      where: {
        vehicleId,
      },
      orderBy: {
        date: 'desc',
      },
      include: {
        items: true,
        category: true,
      },
    });
  }

  async delete(id: string) {
    const log = await this.findById(id);

    if (log.status === 'DELETED') {
      throw new BadRequestException('Service log is already deleted');
    }

    return this.prismaService.serviceLog.update({
      where: {
        id,
      },
      data: {
        status: 'DELETED',
      },
    });
  }

  async findByVehicleId(
    vehicleId: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<PaginatedResponse<ServiceLog>> {
    const offset = (page - 1) * limit;

    const [data, total] = await this.prismaService.$transaction([
      this.prismaService.serviceLog.findMany({
        skip: offset,
        take: limit,
        orderBy: {
          date: 'desc',
        },
        where: {
          vehicleId,
        },
      }),

      this.prismaService.serviceLog.count({
        where: {
          vehicleId,
        },
      }),
    ]);

    return {
      data,
      totalElements: total,
    };
  }
}
