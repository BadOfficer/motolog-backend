import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateMakeDto } from './dto/create-make.dto';
import { getSlug } from 'src/helpers/getSlug';
import { PaginatedResponse } from 'src/interfaces/PaginatedResponse.interface';
import { Make } from 'src/generated/prisma/client';

@Injectable()
export class VehiclesMakesService {
  constructor(private readonly prismaService: PrismaService) {}

  async getAll(
    page: number = 1,
    limit: number = 20,
    query?: string,
  ): Promise<PaginatedResponse<Make>> {
    const offset = (page - 1) * limit;

    const [data, total] = await this.prismaService.$transaction([
      this.prismaService.make.findMany({
        skip: offset,
        take: limit,
        orderBy: {
          title: 'asc',
        },
        where: {
          title: {
            mode: 'insensitive',
            contains: query,
          },
        },
      }),
      this.prismaService.make.count({
        where: {
          title: {
            mode: 'insensitive',
            contains: query,
          },
        },
      }),
    ]);

    return {
      data,
      totalElements: total,
    };
  }

  async getById(id: string) {
    const make = await this.prismaService.make.findUnique({
      where: {
        id,
      },
    });

    if (!make) {
      throw new NotFoundException(`Make ${id} not found`);
    }

    return make;
  }

  async create(dto: CreateMakeDto) {
    const slug = getSlug(dto.title);

    const make = await this.prismaService.make.findUnique({
      where: {
        slug: slug,
      },
    });

    if (make) {
      throw new BadRequestException(`Make ${dto.title} is exist`);
    }

    return this.prismaService.make.create({
      data: {
        title: dto.title,
        slug,
      },
    });
  }

  async delete(id: string) {
    await this.getById(id);

    return this.prismaService.make.delete({
      where: {
        id,
      },
    });
  }
}
