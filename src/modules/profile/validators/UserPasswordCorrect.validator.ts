import { Injectable } from '@nestjs/common';
import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { REQUEST_CONTEXT } from '../../../base/interceptors/inject.user.interceptor';
import { ExtendedValidationArguments } from '../validators/extended.validation.arguments';
import { AuthService } from '../../auth/auth.service';
import { UserService } from '../../user/user.service';

@ValidatorConstraint({ async: true })
@Injectable()
export class UserPasswordCorrectValidatorConstraint
  implements ValidatorConstraintInterface
{
  constructor(
    private authService: AuthService,
    private userService: UserService,
  ) {}

  async validate(password: string, args?: ExtendedValidationArguments) {
    const requestUser = args?.object[REQUEST_CONTEXT].user;

    if (!requestUser) {
      return false;
    }

    const user = await this.userService.findUserById(requestUser.id);

    const checkPassword = await this.authService.checkPassword(user, password);

    if (!checkPassword) {
      return false;
    }

    return true;
  }

  defaultMessage(): string {
    return 'Your current password is incorrect.';
  }
}

export function UserPasswordCorrectValidator(
  validationOptions?: ValidationOptions,
) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'IsUserComment',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: UserPasswordCorrectValidatorConstraint,
    });
  };
}
