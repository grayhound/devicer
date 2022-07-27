import { Body, Controller, Post, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthUserResultDto } from './dto/authUser.result.dto';
import { AuthUserValidatorDto } from './dto/authUser.validator.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post()
  async auth(
    @Body() authUserDto: AuthUserValidatorDto,
  ): Promise<AuthUserResultDto> {
    const authData = await this.authService.tryAuthenticate(authUserDto);

    // if no auth data is returned - this means that user cannot be authenticated
    if (!authData) {
      throw new UnauthorizedException(
        'Cannot authenticate user. Please check `email` and `password`',
      );
    }
    return authData;
  }
}
