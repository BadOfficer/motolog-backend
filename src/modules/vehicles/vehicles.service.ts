import { HttpService } from '@nestjs/axios';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
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
import { SYSTEM_CATEGORIES } from 'src/constants/system-categories';
import { VehiclesMakesService } from '../vehicles-makes/vehicles-makes.service';
import { VehiclesModelsService } from '../vehicles-models/vehicles-models.service';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { isImage } from 'src/utils/file-validation';
import { FilesService } from '../files/files.service';
import { VehicleStatus } from 'src/generated/prisma/enums';

@Injectable()
export class VehiclesService {
  constructor(
    private readonly httpService: HttpService,
    private readonly prismaService: PrismaService,
    private readonly vehicleMakesService: VehiclesMakesService,
    private readonly vehicleModelsService: VehiclesModelsService,
    private readonly filesService: FilesService,
  ) {}

  async decodeVin(vin: string): Promise<DecodeVinResponse> {
    const initialResult: DecodeVinItem = {
      make: null,
      model: null,
      modelYear: null,
      primaryFuel: null,
      secondaryFuel: null,
      displacement: null,
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
      include: {
        make: {
          select: {
            title: true,
          },
        },
        model: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!existVehicle) {
      throw new NotFoundException(`Vehicle with id - ${id} not exist`);
    }

    return existVehicle;
  }

  async verifyVehicle(
    makeId: string,
    modelId: string,
    vin: string,
    year: number,
  ) {
    const make = await this.vehicleMakesService.getById(makeId);
    const model = await this.vehicleModelsService.getModelById(modelId);

    const vinData = await this.decodeVin(vin);

    if (!vinData.make || !vinData.model || !vinData.modelYear) {
      return VehicleStatus.UNVERIFIED;
    }

    const isValidMake = make.title === vinData.make;
    const isValidModel = model.name === vinData.model;
    const isValidYear = year === +vinData.modelYear;

    if (!isValidMake || !isValidModel || !isValidYear) {
      return VehicleStatus.NEEDS_REVIEW;
    }

    return VehicleStatus.VERIFIED;
  }

  async createVehicle(dto: CreateVehicleDto, userId: string) {
    const existCar = await this.prismaService.vehicle.findFirst({
      where: {
        OR: [{ vin: dto.vin }, { licensePlate: dto.licensePlate }],
      },
    });

    if (existCar) {
      throw new BadRequestException(
        `Car with vin - ${dto.vin} or with plates - ${dto.licensePlate} is exist`,
      );
    }

    const vehicleStatus = await this.verifyVehicle(
      dto.makeId,
      dto.modelId,
      dto.vin,
      dto.year,
    );

    return this.prismaService.$transaction(async (tx) => {
      const createdVehicle = await tx.vehicle.create({
        data: {
          ...dto,
          userId,
          vehicleStatus: vehicleStatus,
        },
      });

      const systemCategory = await tx.category.findUnique({
        where: {
          slug: SYSTEM_CATEGORIES.registration.slug,
        },
      });

      const initialServiceLog: CreateServiceLogDto = {
        categoryId: systemCategory?.id || null,
        vehicleId: createdVehicle.id,
        description: 'First vehicle registration',
        mileage: createdVehicle.currentMileage,
        date: createdVehicle.createdAt,
        subTotal: 0,
      };

      await tx.serviceLog.create({
        data: {
          ...initialServiceLog,
          total: 0,
          items: undefined,
        },
      });

      return createdVehicle.id;
    });
  }

  async update(id: string, dto: UpdateVehicleDto) {
    const vehicle = await this.findById(id);
    let vehicleStatus = vehicle.vehicleStatus;

    const checkMake = dto.makeId && dto.makeId !== vehicle.makeId;
    const checkModel = dto.modelId && dto.modelId !== vehicle.modelId;
    const checkYear = dto.year && dto.year !== vehicle.year;

    if (checkMake || checkModel || checkYear) {
      const makeId = dto.makeId || vehicle.makeId;
      const modelId = dto.modelId || vehicle.modelId;
      const year = dto.year || vehicle.year;

      vehicleStatus = await this.verifyVehicle(
        makeId,
        modelId,
        vehicle.vin,
        year,
      );
    }

    return this.prismaService.vehicle.update({
      where: {
        id: vehicle.id,
      },
      data: {
        ...dto,
        vehicleStatus,
        lastMileageUpdate:
          dto.currentMileage !== undefined ? new Date() : undefined,
      },
    });
  }

  private validateImage(file: Express.Multer.File) {
    const isFileImage = isImage(file);

    if (!isFileImage) {
      throw new BadRequestException('File type not supported');
    }
  }

  async updateImage(id: string, file?: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Image file is required');
    }

    const vehicle = await this.findById(id);
    this.validateImage(file);

    let newImagePath: string | null = null;
    const oldImagePath = vehicle.image;

    try {
      newImagePath = await this.filesService.saveFile(file, 'vehicles');

      await this.prismaService.vehicle.update({
        where: {
          id: vehicle.id,
        },
        data: {
          image: newImagePath,
        },
      });
    } catch (e) {
      if (newImagePath) {
        await this.filesService.removeFile(newImagePath);
      }

      if (e instanceof BadRequestException || e instanceof NotFoundException) {
        throw e;
      }

      throw new InternalServerErrorException('Failed to update vehicle image');
    }

    if (oldImagePath) {
      await this.filesService.removeFile(oldImagePath);
    }

    return this.findById(id);
  }

  async removeImage(id: string) {
    const vehicle = await this.findById(id);

    if (!vehicle.image) {
      throw new BadRequestException('Vehicle doesn`t have image');
    }

    await this.filesService.removeFile(vehicle.image);

    return this.prismaService.vehicle.update({
      where: {
        id,
      },
      data: {
        image: null,
      },
    });
  }
}
