import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ServiceCategoriesService } from './service-categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('service-categories')
export class ServiceCategoriesController {
  constructor(
    private readonly serviceCategoriesService: ServiceCategoriesService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async getAllCategories() {
    return this.serviceCategoriesService.findAll();
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async createCategory(@Body() createCategoryDto: CreateCategoryDto) {
    return this.serviceCategoriesService.create(createCategoryDto);
  }
}
