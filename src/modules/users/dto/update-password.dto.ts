import { IsNumber, IsOptional } from 'class-validator';

export class UpdatePasswordDto {
  @IsNumber()
  newPassword!: string;

  @IsOptional()
  oldPassword?: string;
}
