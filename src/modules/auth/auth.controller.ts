import { Body, Controller, HttpException, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { AuthUserValidatorDto } from './dto/authUser.validator.dto';
import { AuthUserResultDto } from './dto/authUser.result.dto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post()
  async auth(@Body() authUserDto: AuthUserValidatorDto): Promise<AuthUserResultDto> {
    const authData = await this.authService.tryAuthenticate(authUserDto);

    // if no auth data is returned - this means that user cannot be authenticated
    if (!authData) {
      throw new HttpException(
        {
          status: HttpStatus.UNAUTHORIZED,
          error:
            'Cannot authenticate user. Please check `email` and `password`',
        },
        HttpStatus.UNAUTHORIZED);
    }
    return authData;
  }
}
