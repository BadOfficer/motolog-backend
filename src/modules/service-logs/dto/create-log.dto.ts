import { IsDate, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateLogDto {
  @IsNotEmpty({ message: 'Category Id is required ' })
  @IsString({ message: 'Category Id must be a string' })
  categoryId!: string;

  @IsNotEmpty({ message: 'Vehicle Id is required ' })
  @IsString({ message: 'Vehicle Id must be a string' })
  vehicleId!: string;

  @IsNotEmpty({ message: 'Description is required ' })
  @IsString({ message: 'Description must be a string' })
  description!: string;

  @IsNumber()
  mileage!: number;

  @IsString({ message: 'Date must be valid' })
  date!: Date;

  @IsNumber()
  @IsNotEmpty({ message: 'Total sum is required' })
  total!: number;
}
