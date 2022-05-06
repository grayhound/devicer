import { Exclude } from 'class-transformer';

export class SignupUserResultDto {
  @Exclude()
  id: string;

  email: string;

  @Exclude()
  emailOriginal: string;

  @Exclude()
  password: string;

  @Exclude()
  passwordCheck: string;

  @Exclude()
  createDateTime: string;

  @Exclude()
  updateDateTime: string;
}
