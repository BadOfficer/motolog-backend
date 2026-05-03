import { IsBoolean, IsInt, IsOptional, IsString } from 'class-validator';
import { IsVin } from '../decorators/IsVIN.decorator';
import { Transform, Type } from 'class-transformer';

export class UpdateVehicleDto {
  @IsString({ message: 'VIN code must be a string' })
  @IsOptional()
  @IsVin()
  vin?: string;

  @IsString({ message: 'Make ID must be a string' })
  @IsOptional()
  makeId?: string;

  @IsString({ message: 'Model ID must be a string' })
  @IsOptional()
  modelId!: string;

  @IsInt({ message: 'Year must be an integer' })
  @IsOptional()
  @Type(() => Number)
  year?: number;

  @IsString({ message: 'Fuel type must be a string' })
  @IsOptional()
  fuelType?: string;

  @IsInt({ message: 'Current mileage must be an integer' })
  @IsOptional()
  @Type(() => Number)
  currentMileage?: number;

  @IsString({ message: 'License plate must be a string' })
  @IsOptional()
  licensePlate?: string;
}
