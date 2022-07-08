import { IsNotEmpty } from 'class-validator';
import { MatchValidator } from '../../../base/validators/match.validator';
import { UserPasswordCorrectValidator } from '../validators/UserPasswordCorrect.validator';

/**
 * DTO to validate data for password change.
 */
export class ProfileChangePasswordValidatorDto {
  @UserPasswordCorrectValidator()
  @IsNotEmpty()
  oldPassword: string;

  @IsNotEmpty()
  newPassword: string;

  @MatchValidator('newPassword', 'PasswordsMatch')
  @IsNotEmpty()
  newPasswordCheck: string;
}
