import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ConfigModule } from '@nestjs/config';
import { VehiclesModule } from './modules/vehicles/vehicles.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { ServiceLogsModule } from './modules/service-logs/service-logs.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    VehiclesModule,
    CategoriesModule,
    ServiceLogsModule,
  ],
})
export class AppModule {}
