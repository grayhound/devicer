import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { ProfileChangePasswordDtoConverter } from './converter/profile.changePassword.dto.converter';
import { ProfileChangePasswordResultDto } from './dto/profileChangePassword.result.dto';
import { ProfileChangePasswordValidatorDto } from './dto/profileChangePassword.validator.dto';

@Injectable()
export class ProfileService {
  constructor(
    private userService: UserService,
    private converter: ProfileChangePasswordDtoConverter,
  ) {}

  /**
   * Change user password.
   *
   * @param {UserJwt} requestUser - Authenticated user from request.
   * @param {ProfileChangePasswordValidatorDto} changePasswordValidatorDto - Validated data from request.
   * @return {User} - User with updated password.
   */
  async changePassword(
    requestUser: UserJwt,
    changePasswordValidatorDto: ProfileChangePasswordValidatorDto,
  ) {
    const user = this.converter.validatorToSave(changePasswordValidatorDto);
    await this.userService.userRepository.update({ id: requestUser.id }, user);
    return user;
  }

  /**
   * Send success message.
   */
  changePasswordResult(): ProfileChangePasswordResultDto {
    return new ProfileChangePasswordResultDto();
  }
}
