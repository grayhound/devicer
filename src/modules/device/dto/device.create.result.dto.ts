import { Expose, Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';

export class DeviceResultDataDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  password: string;
}

export class DeviceCreateResultDto {
  @Type(() => DeviceResultDataDto)
  @ValidateNested()
  @Expose()
  data: DeviceResultDataDto;

  @Expose()
  message = 'Device successfully created.';
}
