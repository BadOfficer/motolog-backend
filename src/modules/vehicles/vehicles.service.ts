import { HttpService } from '@nestjs/axios';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { parseVinResults } from './helpers/parse-vin-results';
import {
  DecodeVinItem,
  DecodeVinResponse,
} from './interfaces/decode-vin-response.interface';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateServiceLogDto } from '../service-logs/dto/create-service-log.dto';

@Injectable()
export class VehiclesService {
  constructor(
    private readonly httpService: HttpService,
    private readonly prismaService: PrismaService,
  ) {}

  async decodeVin(vin: string): Promise<DecodeVinResponse> {
    const initialResult: DecodeVinItem = {
      make: null,
      model: null,
      modelYear: null,
      fuelType: null,
    };

    try {
      const baseUrl = process.env['VIN_API_BASE_URL'];
      const response = await this.httpService.axiosRef.get(
        `${baseUrl}/decodevin/${vin}?format=json`,
      );

      const parsedData = parseVinResults(response.data, initialResult);

      return {
        ...parsedData,
        vin,
        success: true,
      };
    } catch (e) {
      console.log(e);

      return {
        ...initialResult,
        vin,
        success: false,
      };
    }
  }

  async findById(id: string) {
    const existVehicle = await this.prismaService.vehicle.findUnique({
      where: {
        id,
      },
    });

    if (!existVehicle) {
      throw new NotFoundException(`Vehicle with id - ${id} not exist`);
    }

    return existVehicle;
  }

  async createVehicle(createVehicleDto: CreateVehicleDto, userId: string) {
    const existCar = await this.prismaService.vehicle.findFirst({
      where: {
        OR: [
          { vin: createVehicleDto.vin },
          { licensePlate: createVehicleDto.licensePlate },
        ],
      },
    });

    if (existCar) {
      throw new BadRequestException(
        `Car with vin - ${createVehicleDto.vin} or with plates - ${createVehicleDto.licensePlate} is exist`,
      );
    }

    return this.prismaService.$transaction(async (tx) => {
      const createdVehicle = await tx.vehicle.create({
        data: {
          ...createVehicleDto,
          userId,
        },
      });

      const systemCategory = await tx.category.findFirst({
        where: {
          isSystem: true,
        },
      });

      const initialServiceLog: CreateServiceLogDto = {
        categoryId: systemCategory?.id || null,
        vehicleId: createdVehicle.id,
        description: 'Vehicle registration',
        mileage: createdVehicle.currentMileage,
        date: createdVehicle.createdAt,
        total: 0,
      };

      await tx.serviceLog.create({
        data: initialServiceLog,
      });

      return createdVehicle.id;
    });
  }

  async updateMileage(id: string, newMileage: number) {
    await this.findById(id);

    return this.prismaService.vehicle.update({
      where: {
        id,
      },
      data: {
        currentMileage: newMileage,
        lastMileageUpdate: new Date(),
      },
    });
  }
}
