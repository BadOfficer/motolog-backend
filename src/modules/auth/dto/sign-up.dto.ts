import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class SignUpDto {
  @IsEmail()
  email!: string;

  @IsString({ message: 'Password must be a string' })
  @IsNotEmpty({ message: 'Password is required' })
  password!: string;

  @IsString({ message: 'Firstname must be an string' })
  @IsNotEmpty({ message: 'Firstname is required' })
  firstName!: string;

  @IsString({ message: 'Lastname must be an string' })
  @IsNotEmpty({ message: 'Lastname is required' })
  lastName!: string;
}
