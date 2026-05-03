import { IsOptional } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  email!: string;

  @IsOptional()
  firstName?: string;

  @IsOptional()
  lastName?: string;
}
