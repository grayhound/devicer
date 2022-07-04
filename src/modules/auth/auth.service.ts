import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { AuthUserValidatorDto } from './dto/authUser.validator.dto';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import { AuthUserSaveDto } from './dto/authUser.save.dto';
import { AuthUserResultDto } from './dto/authUser.result.dto';
import * as bcrypt from 'bcrypt';
import { User } from '../user/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  /**
   * Try to authenticate user with email and password.
   *
   * @param AuthUserValidatorDto authUserDto
   */
  async tryAuthenticate(
    authUserDto: AuthUserValidatorDto,
  ): Promise<AuthUserResultDto> {
    // first we need to normalize email
    const authUserSaveDto = this.prepareAuthSaveDto(authUserDto);
    const user = await this.userService.findUserByEmail(authUserSaveDto.email);
    // if user not found - return null
    if (!user) {
      return null;
    }

    // now we need to check password
    const passwordCheck = await this.checkPassword(user, authUserDto.password);
    if (!passwordCheck) {
      return null;
    }

    const result: AuthUserResultDto = {
      token: this.generateJWT(user),
    };

    return result;
  }

  /**
   * Format incoming validated data.
   *
   * @param authUserDto
   */
  prepareAuthSaveDto(authUserDto: AuthUserValidatorDto): AuthUserSaveDto {
    const authUserJSON = instanceToPlain(authUserDto);
    const result: AuthUserSaveDto = plainToInstance(
      AuthUserSaveDto,
      authUserJSON,
    );
    return result;
  }

  /**
   * Check that inputed password for the user is correct.
   *
   * @param user
   * @param password
   */
  async checkPassword(user: User, password: string) {
    const result = await bcrypt.compare(password, user.password);
    return result;
  }

  /**
   * Generate Json Web Token for user.
   *
   * @param user
   */
  generateJWT(user: User): string {
    const payload = { email: user.email, sub: user.id };
    return this.jwtService.sign(payload);
  }
}
