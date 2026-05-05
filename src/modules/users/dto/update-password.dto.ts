import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdatePasswordDto {
  @IsString({ message: 'New password must be a string' })
  @IsNotEmpty({ message: 'New password is required' })
  newPassword!: string;

  @IsString({ message: 'Old password must be a string' })
  @IsOptional()
  oldPassword?: string;
}
