import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CategoryDto } from './dto/category.dto';

@Injectable()
export class CategoriesService {
  constructor(private readonly prismaService: PrismaService) {}

  async findById(id: string) {
    const existCategory = await this.prismaService.category.findUnique({
      where: {
        id,
      },
    });

    if (!existCategory) {
      throw new NotFoundException(`Category with ID - ${id} not found`);
    }

    return existCategory;
  }

  async create(categoryDto: CategoryDto) {
    const existCategory = await this.prismaService.category.findUnique({
      where: {
        title: categoryDto.title,
      },
    });

    if (existCategory) {
      throw new BadRequestException(
        `Category - ${existCategory.title} is exist`,
      );
    }

    return this.prismaService.category.create({
      data: categoryDto,
    });
  }

  async update(id: string, categoryDto: CategoryDto) {
    await this.findById(id);

    return this.prismaService.category.update({
      where: {
        id,
      },
      data: categoryDto,
    });
  }

  async delete(id: string) {
    await this.findById(id);

    return this.prismaService.category.delete({
      where: {
        id,
      },
    });
  }
}
