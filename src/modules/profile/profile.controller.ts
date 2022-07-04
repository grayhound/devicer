import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { User } from '../user/entities/user.entity';

@Controller('profile')
export class ProfileController {
  @UseGuards(AuthGuard('jwt'))
  @Get('')
  getProfile(@Request() req): User {
    return req.user;
  }
}
