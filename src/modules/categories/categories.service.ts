import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CategoryDto } from './dto/category.dto';

import slugify from 'slugify';

@Injectable()
export class CategoriesService {
  constructor(private readonly prismaService: PrismaService) {}

  private generateSlug(title: string) {
    return slugify(title, {
      lower: true,
      trim: true,
      replacement: '-',
      remove: undefined,
    });
  }

  private async canChange(id: string) {
    const existCategory = await this.prismaService.category.findUnique({
      where: {
        id,
      },
    });

    if (!existCategory) {
      throw new NotFoundException(`Category ${id} not found`);
    }

    if (existCategory.isSystem) {
      throw new BadRequestException(`Category ${id} is system`);
    }
  }

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

    const slug = this.generateSlug(categoryDto.title);

    return this.prismaService.category.create({
      data: {
        ...categoryDto,
        slug,
      },
    });
  }

  async update(id: string, categoryDto: CategoryDto) {
    await this.canChange(id);

    return this.prismaService.category.update({
      where: {
        id,
      },
      data: categoryDto,
    });
  }

  async delete(id: string) {
    await this.canChange(id);

    return this.prismaService.category.delete({
      where: {
        id,
      },
    });
  }
}
