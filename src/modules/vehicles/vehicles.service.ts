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
import { PaginatedResponse } from 'src/interfaces/PaginatedResponse.interface';
import { ServiceLog } from 'src/generated/prisma/client';

@Injectable()
export class VehiclesService {
  constructor(
    private readonly httpService: HttpService,
    private readonly prismaService: PrismaService,
    private readonly vehicleMakesService: VehiclesMakesService,
    private readonly vehicleModelsService: VehiclesModelsService,
    private readonly filesService: FilesService,
  ) {}

  async getByUserId(userId: string) {
    return this.prismaService.vehicle.findMany({
      where: { userId },
      include: {
        make: {
          select: {
            id: true,
            title: true,
          },
        },
        model: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

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

      let makeId: string | null = null;
      let modelId: string | null = null;

      if (parsedData.make) {
        const make = await this.prismaService.make.findFirst({
          where: { title: { equals: parsedData.make, mode: 'insensitive' } },
        });
        if (make) {
          makeId = make.id;

          if (!make.isSynced) {
            await this.vehicleModelsService.getModelsByMakeId(make.id, 1, 1);
          }

          if (parsedData.model) {
            const model = await this.prismaService.model.findFirst({
              where: {
                makeId: make.id,
                name: { equals: parsedData.model, mode: 'insensitive' },
              },
            });
            if (model) {
              modelId = model.id;
            }
          }
        }
      }

      return {
        ...parsedData,
        vin,
        success: true,
        makeId,
        modelId,
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

    if (existCar && existCar.userId) {
      if (existCar.licensePlate) {
        throw new BadRequestException(
          `Car with vin - ${dto.vin} or with plates - ${dto.licensePlate} is exist`,
        );
      }

      throw new BadRequestException(`Car with vin - ${dto.vin} is exist`);
    }

    if (existCar && !existCar.userId) {
      return await this.link(existCar.id, userId);
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
          isMileageValid: true,
          items: undefined,
        },
      });

      return createdVehicle;
    });
  }

  async unlink(id: string, userId: string) {
    const vehicle = await this.prismaService.vehicle.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!vehicle) {
      throw new NotFoundException('Vehicle not found');
    }

    await this.prismaService.vehicle.update({
      where: {
        id,
        userId,
      },
      data: {
        userId: null,
        previousOwnerId: userId,
      },
    });
    return this.findById(id);
  }

  async update(id: string, dto: UpdateVehicleDto) {
    const vehicle = await this.findById(id);
    let vehicleStatus = vehicle.vehicleStatus;
    const nextVin = dto.vin ?? vehicle.vin;
    const nextLicensePlate =
      dto.licensePlate !== undefined ? dto.licensePlate : vehicle.licensePlate;

    if (dto.vin !== undefined || dto.licensePlate !== undefined) {
      const duplicateVehicle = await this.prismaService.vehicle.findFirst({
        where: {
          id: {
            not: vehicle.id,
          },
          OR: [
            {
              vin: nextVin,
            },
            ...(nextLicensePlate
              ? [
                  {
                    licensePlate: nextLicensePlate,
                  },
                ]
              : []),
          ],
        },
      });

      if (duplicateVehicle) {
        if (duplicateVehicle.vin === nextVin) {
          throw new BadRequestException(`Car with vin - ${nextVin} is exist`);
        }

        if (
          nextLicensePlate &&
          duplicateVehicle.licensePlate === nextLicensePlate
        ) {
          throw new BadRequestException(
            `Car with plates - ${nextLicensePlate} is exist`,
          );
        }
      }
    }

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

    await this.prismaService.vehicle.update({
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
    return this.findById(id);
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

    await this.prismaService.vehicle.update({
      where: {
        id,
      },
      data: {
        image: null,
      },
    });
    return this.findById(id);
  }

  async checkIfVehicleHasOwner(vin: string) {
    const vehicle = await this.prismaService.vehicle.findUnique({
      where: {
        vin,
      },
    });

    if (!vehicle) {
      throw new NotFoundException('Vehicle not found');
    }

    return {
      id: vehicle.id,
      hasOwner: vehicle.userId !== null,
    };
  }

  async link(id: string, userId: string) {
    const existVehicle = await this.findById(id);

    return this.prismaService.$transaction(async (tx) => {
      const updatedVehicle = await tx.vehicle.update({
        where: {
          id: existVehicle.id,
        },
        data: {
          userId,
        },
      });

      const systemCategory = await tx.category.findUnique({
        where: {
          slug: SYSTEM_CATEGORIES.ownership_transfer.slug,
        },
      });

      if (existVehicle.previousOwnerId !== userId) {
        await tx.serviceLog.create({
          data: {
            mileage: updatedVehicle.currentMileage,
            description: 'Vehicle ownership',
            categoryId: systemCategory?.id || null,
            vehicleId: updatedVehicle.id,
            isMileageValid: true,
          },
        });
      }

      return updatedVehicle;
    });
  }


  async getSharedVehicle(id: string) {
    const vehicle = await this.prismaService.vehicle.findUnique({
      where: { id },
      include: {
        make: true,
        model: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        serviceLogs: {
          where: { status: 'ACTIVE' },
          orderBy: { date: 'desc' },
          include: {
            category: true,
            items: true,
          },
        },
      },
    });

    if (!vehicle || vehicle.isPublic === false) {
      throw new NotFoundException('Vehicle not found or is not public');
    }

    return vehicle;
  }

  async getAllForAdmin(page: number = 1, limit: number = 20, query: string = ''): Promise<PaginatedResponse<any>> {
    const offset = (page - 1) * limit;

    const where = query
      ? {
          OR: [
            { vin: { contains: query, mode: 'insensitive' as const } },
            { licensePlate: { contains: query, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const [data, total] = await this.prismaService.$transaction([
      this.prismaService.vehicle.findMany({
        where,
        skip: offset,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          make: { select: { title: true } },
          model: { select: { name: true } },
          user: { select: { id: true, firstName: true, lastName: true, email: true } },
        },
      }),
      this.prismaService.vehicle.count({ where }),
    ]);

    return {
      data,
      totalElements: total,
    };
  }

  async verifyByAdmin(id: string) {
    const vehicle = await this.findById(id);
    
    await this.prismaService.vehicle.update({
      where: { id },
      data: { vehicleStatus: VehicleStatus.VERIFIED },
    });

    return this.findById(id);
  }

  async unlinkByAdmin(id: string) {
    const vehicle = await this.findById(id);
    
    if (!vehicle.userId) {
      throw new BadRequestException('Vehicle has no owner to unlink');
    }

    await this.prismaService.vehicle.update({
      where: { id },
      data: {
        userId: null,
        previousOwnerId: vehicle.userId,
      },
    });

    return this.findById(id);
  }
}

