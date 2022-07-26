import { Expose } from 'class-transformer';

export class SignupPostResultDto {
  @Expose()
  email: string;
}
