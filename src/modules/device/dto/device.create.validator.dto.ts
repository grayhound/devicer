import { IsNotEmpty } from 'class-validator';

export class DeviceCreateValidatorDto {
  @IsNotEmpty()
  name: string;
}
