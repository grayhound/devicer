import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { SignupPostValidatorDto } from './dto/signup/signup.post.validator.dto';
import { SignupPostDtoConverter } from './converters/signup.post.dto.converter';
import { User } from '../user/entities/user.entity';
import { SignupPostResultDto } from './dto/signup/signup.post.result.dto';

@Injectable()
export class SignupService {
  constructor(private readonly userService: UserService) {}

  /**
   * Signup user.
   *
   * We get `validator`, convert it to `save` and get new `User`
   *
   * @param {SignupPostValidatorDto} validatorDto - Validator
   * @return User
   */
  async signup(validatorDto: SignupPostValidatorDto): Promise<User> {
    const saveDto = SignupPostDtoConverter.validatorToSave(validatorDto);
    const user = this.userService.userRepository.create(saveDto);
    await this.userService.userRepository.insert(user);
    return user;
  }

  /**
   * Get JSON response result for `/signup/post`.
   *
   * @param {User} newUser - Newly Signuped User.
   * @return SignupPostResultDto - Result DTO.
   */
  signupResult(newUser: User): SignupPostResultDto {
    const result = SignupPostDtoConverter.userToResult(newUser);
    return result;
  }
}
