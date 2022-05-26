import { Body, Controller, Post } from '@nestjs/common';
import { SignupService } from './signup.service';
import { SignupUserValidatorDto } from './dto/signupUser.validator.dto';
import { SignupUserResultDto } from './dto/signupUser.result.dto';

@Controller('signup')
export class SignupController {
  constructor(private readonly signupService: SignupService) {}

  @Post()
  async create(@Body() signupUserDto: SignupUserValidatorDto): Promise<SignupUserResultDto> {
    // incoming data is validated. Now we can signup user!
    const newUser = await this.signupService.signup(signupUserDto);

    // let's prepare data to return
    const result = this.signupService.signupResult(newUser);
    return result;
  }
}
