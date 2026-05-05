import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class ServiceLogItemDto {
  @IsString({ message: 'Id must be a string' })
  @IsOptional()
  id?: string;

  @IsNotEmpty({ message: 'Name is required' })
  @IsString({ message: 'Name must be an string' })
  name!: string;

  @IsString({ message: 'Brand must be an string' })
  @IsOptional()
  brand?: string;

  @IsString({ message: 'Description must be an string' })
  @IsOptional()
  description?: string;

  @IsString({ message: 'partNumber must be an string' })
  @IsOptional()
  partNumber?: string;

  @IsNumber()
  @Min(0)
  @IsNotEmpty({ message: 'Price is required' })
  @Type(() => Number)
  unitPrice!: number;

  @IsNumber()
  @Min(1)
  @Type(() => Number)
  quantity!: number;
}
