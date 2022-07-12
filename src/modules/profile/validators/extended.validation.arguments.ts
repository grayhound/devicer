import { ValidationArguments } from 'class-validator';
import { REQUEST_CONTEXT } from '../../../base/interceptors/inject.user.interceptor';
import { User } from '../../user/entities/user.entity';

export interface ExtendedValidationArguments extends ValidationArguments {
  object: {
    [REQUEST_CONTEXT]: {
      user: User;
    };
  };
}
