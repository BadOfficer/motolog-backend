import {
  Body,
  Controller,
  Delete,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from 'src/generated/prisma/enums';
import { RolesGuard } from '../auth/guards/roles.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async createCategory(@Body() categoryDto: CreateCategoryDto) {
    return this.categoriesService.create(categoryDto);
  }

  @Patch(':id')
  async updateCategory(
    @Param('id') id: string,
    @Body() categoryDto: UpdateCategoryDto,
  ) {
    return this.categoriesService.update(id, categoryDto);
  }

  @Delete(':id')
  async deleteCategory(@Param('id') id: string) {
    return this.categoriesService.delete(id);
  }
}
