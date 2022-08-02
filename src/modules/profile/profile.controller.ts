import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { InjectUserToBody } from '../../base/decorators/inject.user.decorator';
import { User } from '../user/entities/user.entity';
import { ProfileChangePasswordValidatorDto } from './dto/profileChangePassword.validator.dto';
import { ProfileService } from './profile.service';

@Controller('profile')
export class ProfileController {
  constructor(private profileService: ProfileService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get('')
  getProfile(@Request() req): User {
    return req.user;
  }

  @InjectUserToBody()
  @UseGuards(AuthGuard('jwt'))
  @Post('changePassword')
  @HttpCode(200)
  async changePassword(
    @Body() changePasswordValidatorDto: ProfileChangePasswordValidatorDto,
    @Request() req,
  ) {
    await this.profileService.changePassword(
      req.user,
      changePasswordValidatorDto,
    );

    return this.profileService.changePasswordResult();
  }
}
