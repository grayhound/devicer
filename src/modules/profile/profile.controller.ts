import { Controller, Get, UseGuards, Request, Post, Body } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
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

  @UseGuards(AuthGuard('jwt'))
  @Post('changePassword')
  changePassword(
    @Body() changePasswordValidatorDto: ProfileChangePasswordValidatorDto,
    @Request() req,
  ) {
    this.profileService.changePassword(req.user, changePasswordValidatorDto);
  }
}
