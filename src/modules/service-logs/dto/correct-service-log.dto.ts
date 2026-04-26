import { Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { PartDto } from './part.dto';

export class CorrectServiceLogDto {
  @IsString({ message: 'Category Id must be a string' })
  @IsNotEmpty({ message: 'Category Id is required' })
  categoryId!: string;

  @IsString({ message: 'Description must be a string' })
  @IsNotEmpty({ message: 'Description is required' })
  description!: string;

  @IsInt()
  @IsNotEmpty({ message: 'Description is required' })
  mileage!: number;

  @IsInt()
  @IsNotEmpty({ message: 'Total is required' })
  @Min(0)
  subTotal!: number;

  @IsString()
  date!: Date;

  @IsString({ message: 'Correcting reason must be a string' })
  @IsNotEmpty({ message: 'Correcting reason is required' })
  correctReason!: string;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => PartDto)
  parts?: PartDto[];
}
