import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { SignupService } from '../signup.service';
import normalizeEmail from 'validator/lib/normalizeEmail';

export function UserEmailUniqueValidator(
  validationOptions?: ValidationOptions,
) {
  return (object: any, propertyName: string) => {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: UserEmailUniqueConstraint,
    });
  };
}

@ValidatorConstraint({ name: 'UserEmailUnique', async: true })
@Injectable()
export class UserEmailUniqueConstraint implements ValidatorConstraintInterface {
  constructor(private signupService: SignupService) {}

  async validate(value: number) {
    // normalize email first
    const normalizedEmail = normalizeEmail(value);

    // find user with this email
    const user = await this.signupService.findUserByEmail(normalizedEmail);

    // if user exists - return false
    if (user) {
      return false;
    }

    // if not - user doesn't exist and we can continue
    return true;
  }

  defaultMessage(args: ValidationArguments) {
    return `User with this email already exists`;
  }
}
