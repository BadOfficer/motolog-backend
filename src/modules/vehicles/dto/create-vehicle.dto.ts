import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
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
  @Min(1886, { message: 'Year must be greater than 1885' })
  @Max(2100, { message: 'Year must not exceed 2100' })
  @IsNotEmpty({ message: 'Year is required' })
  year!: number;

  @IsString({ message: 'Fuel type must be a string' })
  @IsNotEmpty({ message: 'Fuel type is required' })
  fuelType!: string;

  @IsInt({ message: 'Current mileage must be an integer' })
  @Min(0, { message: 'Current mileage must be at least 0' })
  @IsNotEmpty({ message: 'Current mileage is required' })
  currentMileage!: number;

  @IsString({ message: 'License plate must be a string' })
  @IsOptional()
  licensePlate?: string;
}
