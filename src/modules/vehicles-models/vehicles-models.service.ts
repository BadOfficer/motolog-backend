import { HttpService } from '@nestjs/axios';
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  ModelsApiResponse,
  ModelsApiResponseEntry,
} from './interfaces/models-api-response.interface';
import { Model } from 'src/generated/prisma/client';
import { VehiclesMakesService } from '../vehicles-makes/vehicles-makes.service';

@Injectable()
export class VehiclesModelsService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly httpService: HttpService,
    private readonly vehicleMakesService: VehiclesMakesService,
  ) {}

  async getModelById(id: string) {
    const model = await this.prismaService.model.findUnique({
      where: {
        id,
      },
    });

    if (!model) {
      throw new NotFoundException(`Model ${id} not found`);
    }

    return model;
  }

  async getModelsByMakeId(makeId: string) {
    const make = await this.vehicleMakesService.getById(makeId);

    if (!make.isSynced && make.externalId) {
      let responseModels: ModelsApiResponseEntry[] = [];

      try {
        const baseUrl = process.env['VIN_API_BASE_URL'];
        const { data: models } =
          await this.httpService.axiosRef.get<ModelsApiResponse>(
            `${baseUrl}/GetModelsForMakeIdYear/makeId/${make.externalId}/vehicleType/car?format=json`,
          );

        responseModels = models.Results;
      } catch (e) {
        console.log(e);
      }

      await this.prismaService.$transaction(async (tx) => {
        if (responseModels.length > 0) {
          const modelsData: Pick<Model, 'name' | 'externalId' | 'makeId'>[] =
            responseModels.map((md) => ({
              name: md.Model_Name,
              externalId: md.Model_ID,
              makeId: make.id,
            }));

          await tx.model.createMany({
            data: modelsData,
            skipDuplicates: true,
          });

          await tx.make.update({
            where: {
              id: make.id,
            },
            data: {
              isSynced: true,
            },
          });
        }
      });
    }

    return this.prismaService.model.findMany({
      where: {
        makeId: make.id,
      },
    });
  }
}
