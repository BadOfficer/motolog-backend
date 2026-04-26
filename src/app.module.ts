import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ConfigModule } from '@nestjs/config';
import { VehiclesModule } from './modules/vehicles/vehicles.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { ServiceLogsModule } from './modules/service-logs/service-logs.module';
import { VehiclesMakesModule } from './modules/vehicles-makes/vehicles-makes.module';
import { VehiclesModelsModule } from './modules/vehicles-models/vehicles-models.module';
import { GlobalHttpModule } from './modules/http/http.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    GlobalHttpModule,
    PrismaModule,
    AuthModule,
    UsersModule,
    VehiclesModule,
    CategoriesModule,
    ServiceLogsModule,
    VehiclesMakesModule,
    VehiclesModelsModule,
  ],
})
export class AppModule {}
