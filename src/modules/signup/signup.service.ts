import { Injectable } from '@nestjs/common';
import { SignupUserValidatorDto } from './dto/signupUser.validator.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { Repository } from 'typeorm';
import { SignupUserSaveDto } from './dto/signupUser.save.dto';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import { SignupUserResultDto } from './dto/signupUser.result.dto';

@Injectable()
export class SignupService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  /**
   * Find user by email.
   *
   * @param email
   */
  async findUserByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findOneBy({ email });
    return user;
  }

  /**
   * Signup user.
   *
   * @param signupUserDto
   */
  async signup(
    signupUserDto: SignupUserValidatorDto,
  ): Promise<SignupUserSaveDto> {
    // first we need to make our signupUserDto a plain JSON object
    const signupUserJSON = instanceToPlain(signupUserDto);
    // set up `emailOriginal` field
    signupUserJSON.emailOriginal = signupUserDto.email;
    // now we can convert it to the SignupUserSaveDto object
    // by doing this we manipulate data to save it correctly.
    const signupUserSaveDto = plainToInstance(
      SignupUserSaveDto,
      signupUserJSON,
    );

    // finally we can save user!
    const user = await this.userRepository.save(signupUserSaveDto);

    return user;
  }

  /**
   * Convert SignupUserSaveDto to SignupUserResultDto.
   * We need to hide some data. We don't need to show our hashed password.
   *
   * @param newUser
   */
  signupResult(newUser: SignupUserSaveDto): SignupUserResultDto {
    const newUserJson = instanceToPlain(newUser);
    const result = plainToInstance(SignupUserResultDto, newUserJson);
    return result;
  }
}
