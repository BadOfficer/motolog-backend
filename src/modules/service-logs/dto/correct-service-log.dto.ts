import { Type } from 'class-transformer';
import {
  IsDate,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { ServiceLogItemDto } from './service-log-item.dto';

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

  @Type(() => Date)
  @IsDate()
  @IsNotEmpty()
  date!: Date;

  @IsString({ message: 'Correcting reason must be a string' })
  @IsNotEmpty({ message: 'Correcting reason is required' })
  correctReason!: string;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ServiceLogItemDto)
  items?: ServiceLogItemDto[];
}
