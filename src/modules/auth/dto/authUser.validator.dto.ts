import { IsEmail, IsNotEmpty } from 'class-validator';

export class AuthUserValidatorDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  password: string;
}
