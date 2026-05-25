import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from 'src/generated/prisma/enums';

@Controller('analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('vehicles/:id/mileage')
  async getVehicleMileageAnalytics(
    @Param('id') vehicleId: string,
    @Query('period') period: string = 'ALL',
  ) {
    return this.analyticsService.getVehicleMileageAnalytics(vehicleId, period);
  }

  @Get('vehicles/:id/summary')
  async getVehicleSummaryStats(@Param('id') vehicleId: string) {
    return this.analyticsService.getVehicleSummaryStats(vehicleId);
  }

  @Get('admin/stats')
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getAdminOverviewStats() {
    return this.analyticsService.getAdminOverviewStats();
  }
}
