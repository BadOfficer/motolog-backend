import { IsArray, IsNotEmpty } from 'class-validator';

export class UpdateMediaDto {
  @IsArray()
  @IsNotEmpty({ message: 'ids to delete is required' })
  idsToDelete!: string[];
}
