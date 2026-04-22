import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateServiceLogDto {
  @IsOptional()
  categoryId?: null | string;

  @IsString({ message: 'Vehicle Id must be a string' })
  @IsNotEmpty({ message: 'Vehicle Id is required' })
  vehicleId!: string;

  @IsString({ message: 'Description must be a string' })
  @IsNotEmpty({ message: 'Description is required' })
  description!: string;

  @IsInt()
  @IsNotEmpty({ message: 'Description is required' })
  mileage!: number;

  @IsInt()
  @IsNotEmpty({ message: 'Total is required' })
  total!: number;

  date!: Date;
}
