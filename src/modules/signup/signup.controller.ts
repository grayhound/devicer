import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import { SignupService } from './signup.service';
import { SignupUserValidatorDto } from './dto/signupUser.validator.dto';

@Controller('signup')
export class SignupController {
  constructor(private readonly signupService: SignupService) {}

  @UseInterceptors(ClassSerializerInterceptor)
  @Post()
  async create(@Body() signupUserDto: SignupUserValidatorDto): Promise<any> {
    // incoming data is validated. Now we can signup user!
    const newUser = await this.signupService.signup(signupUserDto);

    // let's prepare data to return
    const result = this.signupService.signupResult(newUser);
    return result;
  }
}
