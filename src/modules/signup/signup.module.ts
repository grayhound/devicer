import { Module } from '@nestjs/common';
import { SignupController } from './signup.controller';
import { SignupService } from './signup.service';
import { UserEmailUniqueConstraint } from './validators/UserEmailUnique.validator';
import { UserModule } from '../user/user.module';

@Module({
  imports: [UserModule],
  controllers: [SignupController],
  providers: [SignupService, UserEmailUniqueConstraint],
})
export class SignupModule {}
