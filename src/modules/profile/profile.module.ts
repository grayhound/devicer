import { Module } from '@nestjs/common';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';
import { UserPasswordCorrectValidatorConstraint } from './validators/UserPasswordCorrect.validator';
import { UserModule } from '../user/user.module';
import { AuthModule } from '../auth/auth.module';
import { ProfileChangePasswordDtoConverter } from './converter/profile.changePassword.dto.converter';

@Module({
  imports: [UserModule, AuthModule],
  controllers: [ProfileController],
  providers: [
    ProfileService,
    UserPasswordCorrectValidatorConstraint,
    ProfileChangePasswordDtoConverter,
  ],
})
export class ProfileModule {}
