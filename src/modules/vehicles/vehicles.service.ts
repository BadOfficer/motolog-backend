import { HttpService } from '@nestjs/axios';
import { BadRequestException, Injectable } from '@nestjs/common';
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

    return this.prismaService.vehicle.create({
      data: {
        ...createVehicleDto,
        userId,
      },
      select: {
        id: true
      }
    });
  }
}
