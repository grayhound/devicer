import { BadRequestException, Injectable, Scope, UnprocessableEntityException } from '@nestjs/common';
import { ProfileChangePasswordValidatorDto } from './dto/profileChangePassword.validator.dto';

@Injectable()
export class ProfileService {
  // constructor(@Inject(REQUEST) private request: Request) {}

  changePassword(
    user,
    changePasswordValidatorDto: ProfileChangePasswordValidatorDto,
  ) {
    // throw new UnprocessableEntityException();
  }

  tst() {
    // console.log(this.request.user);
  }
}
