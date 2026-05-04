import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { getSlug } from 'src/helpers/getSlug';
import { UpdateCategoryDto } from './dto/update-category';

@Injectable()
export class CategoriesService {
  constructor(private readonly prismaService: PrismaService) {}

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

  async create(categoryDto: CreateCategoryDto) {
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

    const slug = getSlug(categoryDto.title);

    return this.prismaService.category.create({
      data: {
        ...categoryDto,
        slug,
      },
    });
  }

  async update(id: string, categoryDto: UpdateCategoryDto) {
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
