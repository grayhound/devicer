import { Injectable } from '@nestjs/common';
import { ProfileChangePasswordValidatorDto } from './dto/profileChangePassword.validator.dto';
import { UserService } from '../user/user.service';
import { plainToInstance } from 'class-transformer';
import { ProfileChangePasswordSaveDto } from './dto/profileChangePassword.save.dto';

@Injectable()
export class ProfileService {
  constructor(private userService: UserService) {}

  /**
   * Change user password.
   *
   * @param requestUser
   * @param changePasswordValidatorDto
   */
  async changePassword(
    requestUser,
    changePasswordValidatorDto: ProfileChangePasswordValidatorDto,
  ) {
    const user = await this.userService.findUserById(requestUser.id);

    const changePasswordUserJSON = {
      password: changePasswordValidatorDto.newPassword,
    };
    const changePasswordUserSaveDto = plainToInstance(
      ProfileChangePasswordSaveDto,
      changePasswordUserJSON,
    );

    user.password = changePasswordUserSaveDto.password;

    await this.userService.saveUser(user);
  }

  /**
   * Send success message.
   */
  changePasswordResult() {
    return {
      message: 'User password changed successfully',
    };
  }
}
