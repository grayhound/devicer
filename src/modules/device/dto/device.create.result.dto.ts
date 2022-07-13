import { Expose } from 'class-transformer';

export class DeviceCreateResultDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  password: string;
}
