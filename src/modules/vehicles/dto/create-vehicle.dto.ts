import { Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { IsVin } from '../decorators/IsVIN.decorator';

export class CreateVehicleDto {
  @IsString({ message: 'VIN code must be a string' })
  @IsNotEmpty({ message: 'VIN code is required!' })
  @IsVin()
  vin!: string;

  @IsString({ message: 'Make ID must be a string' })
  @IsNotEmpty({ message: 'Make ID is required' })
  makeId!: string;

  @IsString({ message: 'Model ID must be a string' })
  @IsNotEmpty({ message: 'Model ID is required' })
  modelId!: string;

  @IsInt({ message: 'Year must be an integer' })
  @Min(1980, { message: 'Year must be greater than 1980' })
  @Max(2026, { message: 'Year must not exceed 2026' })
  @IsNotEmpty({ message: 'Year is required' })
  @Type(() => Number)
  year!: number;

  @IsString({ message: 'Primary fuel type must be a string' })
  @IsNotEmpty({ message: 'Primary fuel type is required' })
  primaryFuel!: string;

  @IsInt({ message: 'Current mileage must be an integer' })
  @Min(0, { message: 'Current mileage must be at least 0' })
  @IsNotEmpty({ message: 'Current mileage is required' })
  @Type(() => Number)
  currentMileage!: number;

  @IsString({ message: 'Displacement must be an string' })
  @IsNotEmpty({ message: 'Displacement is required' })
  displacement?: string;

  @IsString({ message: 'License plate must be a string' })
  @IsOptional()
  licensePlate?: string;

  @IsString({ message: 'Secondary fuel type must be a string' })
  @IsOptional()
  secondaryFuel?: string;
}
