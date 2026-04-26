import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateMakeDto } from './dto/create-make.dto';
import { getSlug } from 'src/helpers/getSlug';

@Injectable()
export class VehiclesMakesService {
  constructor(private readonly prismaService: PrismaService) {}

  async getAll() {
    return this.prismaService.make.findMany();
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
}
