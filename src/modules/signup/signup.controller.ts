import { Body, Controller, Post } from '@nestjs/common';
import { SignupService } from './signup.service';
import { SignupPostValidatorDto } from './dto/signup/signup.post.validator.dto';
import { SignupPostResultDto } from './dto/signup/signup.post.result.dto';

@Controller('signup')
export class SignupController {
  constructor(private readonly signupService: SignupService) {}

  @Post()
  async post(
    @Body() signupPostDto: SignupPostValidatorDto,
  ): Promise<SignupPostResultDto> {
    const newUser = await this.signupService.signup(signupPostDto);
    const result = this.signupService.signupResult(newUser);
    return result;
  }
}
