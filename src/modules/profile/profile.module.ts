import { Module } from '@nestjs/common';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';
import { UserPasswordCorrectValidatorConstraint } from './validators/UserPasswordCorrect.validator';
import { UserModule } from '../user/user.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [UserModule, AuthModule],
  controllers: [ProfileController],
  providers: [ProfileService, UserPasswordCorrectValidatorConstraint],
})
export class ProfileModule {}
