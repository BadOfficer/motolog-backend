import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateServiceLogDto } from './dto/create-service-log.dto';
import { CorrectServiceLogDto } from './dto/correct-service-log.dto';
import { PartDto } from './dto/part.dto';

@Injectable()
export class ServiceLogsService {
  constructor(private readonly prismaService: PrismaService) {}

  private calculateTotal(parts: PartDto[], subTotal: number) {
    const partsTotal = parts.reduce(
      (sum, part) => sum + part.price * part.quantity,
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

    if (prevRecord && prevRecord.mileage >= newMileage) {
      throw new BadRequestException(
        `Mileage must be greater than ${prevRecord.mileage}`,
      );
    }

    if (nextRecord && nextRecord.mileage <= newMileage) {
      throw new BadRequestException(
        `Mileage must be less than ${nextRecord.mileage}`,
      );
    }

    return {
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
    const recordDate = new Date(dto.date);

    await this.validateRecordMileage(dto.vehicleId, dto.mileage, recordDate);

    const parts = dto?.parts || [];

    const total = this.calculateTotal(parts, dto.subTotal);

    return this.prismaService.$transaction(async (tx) => {
      const newLog = await tx.serviceLog.create({
        data: {
          ...dto,
          total,
          date: recordDate,
          parts: {
            createMany: {
              data: parts,
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

    if (log.status === 'CORRECTED') {
      throw new BadRequestException(`You cannot correct corrected log before`);
    }

    const recordDate = new Date(dto.date);

    const { nextRecord } = await this.validateRecordMileage(
      log.vehicleId,
      dto.mileage,
      recordDate,
    );

    const parts = dto?.parts ?? [];

    const total = this.calculateTotal(parts, dto.subTotal);

    return this.prismaService.$transaction(async (tx) => {
      const newLog = await tx.serviceLog.create({
        data: {
          ...dto,
          vehicleId: log.vehicleId,
          total,
          date: recordDate,
          status: 'ACTIVE',
          parts: {
            createMany: {
              data: parts,
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

  async delete(id: string) {
    await this.findById(id);

    return this.prismaService.serviceLog.update({
      where: {
        id,
      },
      data: {
        status: 'DELETED',
      },
    });
  }
}
