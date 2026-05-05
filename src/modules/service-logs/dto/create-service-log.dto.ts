import {
  IsArray,
  IsDate,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxDate,
  Min,
  ValidateNested,
} from 'class-validator';
import { ServiceLogItemDto } from './service-log-item.dto';
import { Type } from 'class-transformer';

export class CreateServiceLogDto {
  @IsString({ message: 'Category Id must be a string' })
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
  @Type(() => Number)
  mileage!: number;

  @IsInt()
  @Min(0)
  @Type(() => Number)
  subTotal!: number;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ServiceLogItemDto)
  items?: ServiceLogItemDto[];

  @Type(() => Date)
  @IsDate()
  @IsNotEmpty()
  @MaxDate(new Date(), { message: 'Date must not be in the future' })
  date!: Date;
}
