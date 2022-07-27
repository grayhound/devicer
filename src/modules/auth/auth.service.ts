import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import { User } from '../user/entities/user.entity';
import { UserService } from '../user/user.service';
import { AuthUserResultDto } from './dto/authUser.result.dto';
import { AuthUserSaveDto } from './dto/authUser.save.dto';
import { AuthUserValidatorDto } from './dto/authUser.validator.dto';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  /**
   * Try to authenticate user with email and password.
   *
   * @param {AuthUserValidatorDto} authUserDto - Auth Validator.
   * @return {AuthUserResultDto} - Authentication result to return to user.
   */
  async tryAuthenticate(
    authUserDto: AuthUserValidatorDto,
  ): Promise<AuthUserResultDto> {
    const authUserSaveDto = this.prepareAuthSaveDto(authUserDto);
    const user = await this.userService.findUserByEmail(authUserSaveDto.email);
    if (!user) {
      return null;
    }

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
   * @param {AuthUserValidatorDto} authUserDto
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
  async checkPassword(user: User, password: string): Promise<boolean> {
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
