import { IsNotEmpty, IsString } from 'class-validator';
import { IsVin } from '../decorators/IsVIN.decorator';

export class DecodeVinDto {
  @IsString({ message: 'VIN code must be a string' })
  @IsNotEmpty({ message: 'VIN code is required!' })
  @IsVin()
  vin!: string;
}
