import { Module } from '@nestjs/common';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';
import { UserPasswordCorrectConstraint } from './validators/UserPasswordCorrect.validator';
import { UserModule } from '../user/user.module';

@Module({
  imports: [UserModule],
  controllers: [ProfileController],
  providers: [ProfileService, UserPasswordCorrectConstraint],
})
export class ProfileModule {}
