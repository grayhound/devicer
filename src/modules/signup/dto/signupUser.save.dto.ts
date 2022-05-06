import { Exclude, Transform } from 'class-transformer';
import * as bcrypt from 'bcrypt';
import normalizeEmail from 'validator/lib/normalizeEmail';

/**
 * This is a DTO that converts incoming validated data.
 * Here we hide `passwordCheck`, hash `password` field, normalize `email` field
 */
export class SignupUserSaveDto {
  // normalize email
  @Transform(({ value }) => normalizeEmail(value))
  email: string;

  emailOriginal: string;

  // hash password. Never save plaing passwords!
  @Transform(({ value }) => bcrypt.hashSync(value, 12))
  password: string;

  // we don't need to save this field, so we are excluding it from result.
  @Exclude()
  passwordCheck: string;
}
