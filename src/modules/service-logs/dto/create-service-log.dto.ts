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
import { Type } from 'class-transformer';

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
  @Min(0)
  subTotal!: number;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ServiceLogItemDto)
  items?: ServiceLogItemDto[];

  @Type(() => Date)
  @IsDate()
  @IsNotEmpty()
  date!: Date;
}
