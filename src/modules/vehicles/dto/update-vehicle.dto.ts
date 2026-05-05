import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { IsVin } from '../decorators/IsVIN.decorator';

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
  modelId?: string;

  @IsInt({ message: 'Year must be an integer' })
  @Min(1980, { message: 'Year must be greater than 1980' })
  @Max(2026, { message: 'Year must not exceed 2026' })
  @IsOptional()
  @Type(() => Number)
  year?: number;

  @IsOptional()
  @IsString({ message: 'Primary fuel type must be a string' })
  primaryFuel?: string;

  @IsInt({ message: 'Current mileage must be an integer' })
  @Min(0, { message: 'Current mileage must be at least 0' })
  @IsOptional()
  @Type(() => Number)
  currentMileage?: number;

  @IsString({ message: 'Displacement must be a string' })
  @IsOptional()
  displacement?: string;

  @IsString({ message: 'License plate must be a string' })
  @IsOptional()
  licensePlate?: string;

  @IsString({ message: 'Secondary fuel type must be a string' })
  @IsOptional()
  secondaryFuel?: string;
}
