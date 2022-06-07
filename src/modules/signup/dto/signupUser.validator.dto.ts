import { IsEmail, IsNotEmpty } from 'class-validator';
import { UserEmailUniqueValidator } from '../validators/UserEmailUnique.validator';
import { MatchValidator } from '../../../base/validators/match.validator';

export class SignupUserValidatorDto {
  @UserEmailUniqueValidator()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  password: string;

  @MatchValidator('password', 'PasswordsMatch')
  @IsNotEmpty()
  passwordCheck: string;
}
