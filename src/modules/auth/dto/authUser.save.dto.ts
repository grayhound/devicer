import { Transform } from 'class-transformer';
import normalizeEmail from 'validator/lib/normalizeEmail';

/**
 * This is a DTO that converts incoming validated data.
 * Here we just normalize `email` field
 */
export class AuthUserSaveDto {
  // normalize email
  @Transform(({ value }) => normalizeEmail(value))
  email: string;

  password: string;
}
