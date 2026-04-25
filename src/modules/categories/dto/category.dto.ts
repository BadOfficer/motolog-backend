import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CategoryDto {
  @IsString({ message: 'Title must be a string' })
  @IsNotEmpty({ message: 'Title is required' })
  title!: string;
}
