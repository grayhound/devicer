import { Expose, Transform } from 'class-transformer';
import * as bcrypt from 'bcrypt';
import normalizeEmail from 'validator/lib/normalizeEmail';

/**
 * This is a DTO that converts incoming validated data.
 */
export class SignupPostSaveDto {
  // normalize email
  @Transform(({ value }) => normalizeEmail(value))
  @Expose()
  email: string;

  @Expose()
  emailOriginal: string;

  // hash password. Never save plain passwords!
  @Transform(({ value }) => bcrypt.hashSync(value, 12))
  @Expose()
  password: string;
}
