import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class ServiceLogItemDto {
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
  @IsNotEmpty({ message: 'Price is required' })
  unitPrice!: number;

  @IsNumber()
  @Min(1)
  quantity!: number;
}
