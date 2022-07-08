import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { UserService } from '../../user/user.service';

export function UserPasswordCorrectValidator(
  validationOptions?: ValidationOptions,
) {
  return (object: any, propertyName: string) => {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: UserPasswordCorrectConstraint,
    });
  };
}

@ValidatorConstraint({ name: 'UserPasswordCorrect', async: true })
@Injectable()
export class UserPasswordCorrectConstraint
  implements ValidatorConstraintInterface
{
  constructor(private userService: UserService) {}

  async validate(value: string) {
    console.log(this.userService);
    /*
    const user = await this.userService.findUserId(req.user.userId);

    // if user exists - return false
    if (user) {
      return false;
    }

    // if not - user doesn't exist and we can continue
    */
    return true;
  }

  defaultMessage(args: ValidationArguments) {
    return `User with this email already exists`;
  }
}
