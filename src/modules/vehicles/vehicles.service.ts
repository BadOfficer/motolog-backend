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

@Injectable()
export class VehiclesService {
  constructor(
    private readonly httpService: HttpService,
    private readonly prismaService: PrismaService,
  ) {}

  async findById(carId: string) {
    const existCar = await this.prismaService.vehicle.findUnique({
      where: {
        id: carId,
      },
    });

    if (!existCar) {
      throw new NotFoundException(`Car with id - ${carId} not found`);
    }

    return existCar;
  }

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

  async createVehicle(createVehicleDto: CreateVehicleDto, userId: string) {
    const existCar = await this.prismaService.vehicle.findUnique({
      where: {
        vin: createVehicleDto.vin,
      },
    });

    if (existCar) {
      throw new BadRequestException(
        `Car with vin - ${createVehicleDto.vin} is exist`,
      );
    }

    const truthyCarData = await this.decodeVin(createVehicleDto.vin);

    if (truthyCarData.make && truthyCarData.make !== createVehicleDto.make) {
      throw new BadRequestException(
        `Invalid make for vin - ${createVehicleDto.vin}`,
      );
    }

    return this.prismaService.vehicle.create({
      data: {
        ...createVehicleDto,
        userId,
      },
      select: {
        id: true,
      },
    });
  }

  async updateMileage(carId: string, newMileage: number) {
    return this.prismaService.vehicle.update({
      where: {
        id: carId,
      },
      data: {
        currentMileage: newMileage,
        lastMileageUpdate: new Date(),
      },
    });
  }
}
