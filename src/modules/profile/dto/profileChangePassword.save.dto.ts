import { Exclude, Transform } from 'class-transformer';
import * as bcrypt from 'bcrypt';

/**
 * DTO to save new password.
 */
export class ProfileChangePasswordSaveDto {
  // hash password. Never save plaing passwords!
  @Transform(({ value }) => bcrypt.hashSync(value, 12))
  password: string;
}
