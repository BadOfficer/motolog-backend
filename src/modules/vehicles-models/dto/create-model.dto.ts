import { IsNotEmpty, IsString } from 'class-validator';

export class CreateModelDto {
  @IsNotEmpty({ message: 'Make ID is required' })
  @IsString({ message: 'Make ID must be a string' })
  makeId!: string;

  @IsNotEmpty({ message: 'Name is required' })
  @IsString({ message: 'Name must be a string' })
  name!: string;
}
