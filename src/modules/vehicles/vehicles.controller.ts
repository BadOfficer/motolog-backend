import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { VehiclesService } from './vehicles.service';
import { DecodeVinDto } from './dto/decode-vin.dto';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthUser } from '../auth/interfaces/auth-user.interface';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Role } from 'src/generated/prisma/enums';

@Controller('vehicles')
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) {}

  @Get('/admin/all')
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getAllForAdmin(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
    @Query('query') query: string = '',
  ) {
    return this.vehiclesService.getAllForAdmin(+page, +limit, query);
  }

  @Patch('/admin/:id/verify')
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async verifyByAdmin(@Param('id') id: string) {
    return this.vehiclesService.verifyByAdmin(id);
  }

  @Patch('/admin/:id/unlink')
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async unlinkByAdmin(@Param('id') id: string) {
    return this.vehiclesService.unlinkByAdmin(id);
  }

  @Get('/my')
  @UseGuards(JwtAuthGuard)
  async getMyVehicles(@CurrentUser() user: AuthUser) {
    return this.vehiclesService.getByUserId(user.id);
  }

  @Post('/decode-vin')
  @UseGuards(JwtAuthGuard)
  async decodeVin(@Body() vinBody: DecodeVinDto) {
    return this.vehiclesService.decodeVin(vinBody.vin);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async createVehicle(
    @Body() createVehicleDto: CreateVehicleDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.vehiclesService.createVehicle(createVehicleDto, user.id);
  }

  @Get('/shared/:id')
  @UseGuards(JwtAuthGuard)
  async getSharedVehicle(@Param('id') id: string) {
    return this.vehiclesService.getSharedVehicle(id);
  }


  @Patch(':id/update-mileage')
  @UseGuards(JwtAuthGuard)
  async updateVehicleMileage(
    @Param('id') id: string,
    @Query('mileage') mileage: string,
  ) {
    const { currentMileage, ...dto } = new UpdateVehicleDto();

    return this.vehiclesService.update(id, {
      ...dto,
      currentMileage: +mileage,
    });
  }

  @Patch(':id/update-image')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('image'))
  async updateImage(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.vehiclesService.updateImage(id, file);
  }

  @Patch('/:id')
  @UseGuards(JwtAuthGuard)
  async updateVehicle(@Param('id') id: string, @Body() dto: UpdateVehicleDto) {
    return this.vehiclesService.update(id, dto);
  }

  @Delete(':id/remove-image')
  @UseGuards(JwtAuthGuard)
  async removeImage(@Param('id') id: string) {
    return this.vehiclesService.removeImage(id);
  }

  @Patch(':id/unlink/:userId')
  @UseGuards(JwtAuthGuard)
  async unlinkVehicle(
    @Param('id') id: string,
    @Param('userId') userId: string,
  ) {
    return this.vehiclesService.unlink(id, userId);
  }

  @Patch(':id/link/:userId')
  @UseGuards(JwtAuthGuard)
  async linkVehicle(@Param('id') id: string, @Param('userId') userId: string) {
    return this.vehiclesService.link(id, userId);
  }

  @Get('/has-owner/:vin')
  @UseGuards(JwtAuthGuard)
  async checkIfVehicleHasOwner(@Param('vin') vin: string) {
    return this.vehiclesService.checkIfVehicleHasOwner(vin);
  }

  @Get('/:id')
  @UseGuards(JwtAuthGuard)
  async getVehicleById(@Param('id') id: string) {
    return this.vehiclesService.findById(id);
  }
}
