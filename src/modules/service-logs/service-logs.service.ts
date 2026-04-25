import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateServiceLogDto } from './dto/create-service-log.dto';
import { CorrectServiceLogDto } from './dto/correct-service-log.dto';

@Injectable()
export class ServiceLogsService {
  constructor(private readonly prismaService: PrismaService) {}
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

    return this.prismaService.$transaction(async (tx) => {
      const newLog = await tx.serviceLog.create({
        data: {
          ...dto,
          date: recordDate,
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

    const recordDate = new Date(dto.date);

    const { nextRecord } = await this.validateRecordMileage(
      log.vehicleId,
      dto.mileage,
      recordDate,
    );

    return this.prismaService.$transaction(async (tx) => {
      await tx.serviceLog.update({
        where: {
          id: id,
        },
        data: {
          correctedLogId: id,
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

      return tx.serviceLog.create({
        data: {
          ...dto,
          correctReason: null,
          vehicleId: log.vehicleId,
          status: 'ACTIVE',
          date: recordDate,
        },
      });
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
