import { Expose, Transform } from 'class-transformer';
import * as bcrypt from 'bcrypt';

export class DeviceCreateSaveDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  password: string;

  @Expose()
  @Transform(({ value }) => bcrypt.hashSync(value, 12))
  mqttPassword: string;

  @Expose()
  userId: string;
}
