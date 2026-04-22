import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CorrectServiceLogDto {
  @IsString({ message: 'Category Id must be a string' })
  @IsNotEmpty({ message: 'Category Id is required' })
  categoryId!: string;

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

  @IsString({ message: 'Correcting reason must be a string' })
  @IsNotEmpty({ message: 'Correcting reason is required' })
  correctReason!: string;
}
