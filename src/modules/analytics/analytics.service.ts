import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getVehicleMileageAnalytics(vehicleId: string, period: string) {
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id: vehicleId },
    });

    if (!vehicle) {
      throw new NotFoundException('Vehicle not found');
    }

    const now = new Date();
    let startDate: Date | null = null;

    if (period === '1M') {
      startDate = new Date(now.setMonth(now.getMonth() - 1));
    } else if (period === '3M') {
      startDate = new Date(now.setMonth(now.getMonth() - 3));
    } else if (period === '6M') {
      startDate = new Date(now.setMonth(now.getMonth() - 6));
    } else if (period === '1Y') {
      startDate = new Date(now.setFullYear(now.getFullYear() - 1));
    }

    const whereClause: any = {
      vehicleId,
      status: 'ACTIVE',
    };

    if (startDate) {
      whereClause.date = { gte: startDate };
    }

    const logs = await this.prisma.serviceLog.findMany({
      where: whereClause,
      orderBy: { date: 'asc' },
      select: {
        date: true,
        mileage: true,
      },
    });

    // Add initial vehicle creation point if it falls within the period or if it's the only data point
    const results = [];

    // However, vehicle.currentMileage is current, not initial.
    // The initial registration log is created automatically when the vehicle is added!
    // So we don't need to manually inject it. The initial registration log will be in `logs`!

    return logs.map((log) => ({
      date: log.date.toISOString(),
      mileage: log.mileage,
    }));
  }

  async getVehicleSummaryStats(vehicleId: string) {
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id: vehicleId },
    });

    if (!vehicle) {
      throw new NotFoundException('Vehicle not found');
    }

    const logs = await this.prisma.serviceLog.findMany({
      where: {
        vehicleId,
        status: 'ACTIVE',
      },
      orderBy: { date: 'asc' },
    });

    const totalLogs = logs.length;
    const totalSpent = logs.reduce((acc, log) => acc + Number(log.total), 0);
    
    let totalDistance = 0;
    if (logs.length > 0) {
      const minMileage = Math.min(...logs.map(l => l.mileage));
      const maxMileage = Math.max(...logs.map(l => l.mileage));
      totalDistance = maxMileage - minMileage;
    }

    return {
      totalLogs,
      totalSpent,
      totalDistance,
    };
  }

  async getAdminOverviewStats() {
    const [totalUsers, totalVehicles, totalCategories, totalServiceLogs] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.vehicle.count(),
      this.prisma.category.count(),
      this.prisma.serviceLog.count(),
    ]);

    return {
      totalUsers,
      totalVehicles,
      totalCategories,
      totalServiceLogs,
    };
  }
}
