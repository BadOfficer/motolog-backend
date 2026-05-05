import { IsOptional, IsString } from 'class-validator';

export class UpdateCategoryDto {
  @IsString({ message: 'Title must be a string' })
  @IsOptional()
  title?: string;
}
