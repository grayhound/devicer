import { Expose, Transform } from 'class-transformer';
import * as bcrypt from 'bcrypt';

/**
 * DTO to save new password.
 */
export class ProfileChangePasswordSaveDto {
  @Expose()
  @Transform(({ value }) => bcrypt.hashSync(value, 12))
  password: string;
}
