import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateLogDto } from './dto/create-log.dto';
import { VehiclesService } from '../vehicles/vehicles.service';
import { UpdateLogDto } from './dto/update-log.dto';

@Injectable()
export class ServiceLogsService {
  private static readonly CHANGE_TIME_MS = 15 * 60 * 1000;

  constructor(
    private readonly prismaService: PrismaService,
    private readonly vehiclesService: VehiclesService,
  ) {}

  private async validateRecord(
    vehicleId: string,
    date: Date,
    mileage: number,
    excludeId?: string,
  ) {
    const prevRecord = await this.prismaService.serviceLog.findFirst({
      where: {
        vehicleId: vehicleId,
        id: excludeId ? { not: excludeId } : undefined,
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
        vehicleId: vehicleId,
        id: excludeId ? { not: excludeId } : undefined,
        date: {
          gt: date,
        },
      },
      orderBy: {
        date: 'asc',
      },
    });

    if (prevRecord && prevRecord.mileage > mileage) {
      throw new BadRequestException(
        `Mileage can't be less than mileage in record before new record`,
      );
    }

    if (nextRecord && nextRecord.mileage < mileage) {
      throw new BadRequestException(
        `Mileage can't be greater than mileage in record after new record`,
      );
    }
  }

  private canChange(lastModifyDate: Date) {
    const updateMinutes = lastModifyDate.getTime();
    const timeDifference = Date.now() - updateMinutes;

    return timeDifference <= ServiceLogsService.CHANGE_TIME_MS;
  }

  async findById(logId: string) {
    const log = await this.prismaService.serviceLog.findUnique({
      where: {
        id: logId,
      },
    });

    if (!log) {
      throw new NotFoundException(`Service log with id - ${logId} not found`);
    }

    return log;
  }

  async create(createLogDto: CreateLogDto) {
    const vehicle = await this.vehiclesService.findById(createLogDto.vehicleId);

    const recordDate = new Date(createLogDto.date);

    await this.validateRecord(
      createLogDto.vehicleId,
      recordDate,
      createLogDto.mileage,
    );

    if (createLogDto.mileage > vehicle.currentMileage) {
      await this.vehiclesService.updateMileage(
        createLogDto.vehicleId,
        createLogDto.mileage,
      );
    }

    return this.prismaService.serviceLog.create({
      data: { ...createLogDto, date: recordDate },
    });
  }

  async update(logId: string, updateLogDto: UpdateLogDto) {
    const existLog = await this.findById(logId);
    const newDate = new Date(updateLogDto.date);

    await this.validateRecord(
      existLog.vehicleId,
      newDate,
      updateLogDto.mileage,
      existLog.id,
    );

    if (!this.canChange(existLog.createdAt)) {
      throw new BadRequestException('The time for change is over');
    }

    return this.prismaService.$transaction(async (tx) => {
      const updatedLog = await tx.serviceLog.update({
        where: {
          id: logId,
        },
        data: {
          ...updateLogDto,
          date: newDate,
        },
      });

      const latestLog = await tx.serviceLog.findFirst({
        where: {
          vehicleId: existLog.vehicleId,
        },
        orderBy: {
          date: 'desc',
        },
      });

      if (latestLog && latestLog.id === logId) {
        await this.vehiclesService.updateMileage(
          existLog.vehicleId,
          latestLog.mileage,
        );
      }

      return updatedLog;
    });
  }

  async delete(logId: string) {
    const log = await this.findById(logId);

    const isCanDelete = this.canChange(log.createdAt);
    if (!isCanDelete) {
      throw new BadRequestException('Time is out');
    }

    await this.prismaService.$transaction(async (tx) => {
      await tx.serviceLog.delete({
        where: {
          id: logId,
        },
      });

      const lastLog = await tx.serviceLog.findFirst({
        where: {
          vehicleId: log.vehicleId,
        },
        orderBy: {
          date: 'desc',
        },
      });

      if (lastLog?.mileage) {
        await this.vehiclesService.updateMileage(
          lastLog.vehicleId,
          lastLog.mileage,
        );
      }
    });

    return 'Service log has been deleted';
  }
}
