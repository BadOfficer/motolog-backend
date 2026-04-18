import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';

@Injectable()
export class ServiceCategoriesService {
  constructor(private readonly prismaService: PrismaService) {}

  async findAll() {
    return this.prismaService.serviceCategory.findMany();
  }

  async findById(id: string) {
    const category = await this.prismaService.serviceCategory.findUnique({
      where: {
        id,
      },
    });

    if (!category) {
      throw new NotFoundException(`Category with id - ${id} not found`);
    }
  }

  async create(createCategoryDto: CreateCategoryDto) {
    const existCategory = await this.prismaService.serviceCategory.findUnique({
      where: {
        title: createCategoryDto.title,
      },
    });

    if (existCategory) {
      throw new BadRequestException(
        `Category ${createCategoryDto.title} is exist`,
      );
    }

    return this.prismaService.serviceCategory.create({
      data: createCategoryDto,
    });
  }
}
