## Change password.

You may ask why the hell do you need a chapter about `Change Password`.

That should be simple one, right?

Not with NestJS, unfortunately. 

To change password we need 3 fields:
- old password
- new password
- new password check

It's quite obvious how DTO should work with `new password` and `new password check`.

But when it comes to checking the `old password` we are a getting a problem.

We are using `@UseGuards(AuthGuard('jwt'))` for `profile` controller and with help of it we can get user from request.

It will be the same way for `change password`. I was hoping that I will just get user from request in custom validator and compare user inputted password.

The problem is - we cannot inject `Request` object into the custom validator.

[Devs explain it this way.](https://github.com/nestjs/nest/issues/1955#issuecomment-481991787)

Welp, I can understand that. 

But we still can inject Services to the custom validators, so this limitation seems strange to me.

I was hoping that I can inject Service with already injected Request - but that doesn't work either.

Thankfully I found an article [Injecting request object to a custom validation class in NestJS](https://dev.to/avantar/injecting-request-object-to-a-custom-validation-class-in-nestjs-5dal)

We will try to implement that solution here.

Create `validator` and `save` DTO's.

Create `/src/modules/profile/dto/profileChangePassword.validator.dto.ts`:

```typescript
import { IsNotEmpty } from 'class-validator';
import { MatchValidator } from '../../../base/validators/match.validator';
import { UserPasswordCorrectValidator } from '../validators/UserPasswordCorrect.validator';

/**
 * DTO to validate data for password change.
 */
export class ProfileChangePasswordValidatorDto {
  @UserPasswordCorrectValidator()
  @IsNotEmpty()
  oldPassword: string;

  @IsNotEmpty()
  newPassword: string;

  @MatchValidator('newPassword', 'PasswordsMatch')
  @IsNotEmpty()
  newPasswordCheck: string;
}
```

Create `/src/modules/profile/dto/profileChangePassword.save.dto.ts`:

```typescript
import { Exclude, Transform } from 'class-transformer';
import * as bcrypt from 'bcrypt';

/**
 * DTO to save new password.
 */
export class ProfileChangePasswordSaveDto {
  // hash password. Never save plaing passwords!
  @Transform(({ value }) => bcrypt.hashSync(value, 12))
  password: string;
}
```

As you can see there's `UserPasswordCorrectValidator` which doesn't exist yet. 

That's why we need to follow that guide to create a way to inject Request.

We will make small changes in the code for that guide.

First we start with interceptor `src/base/interceptors/inject.user.interceptor.ts`:

```typescript
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';

export const REQUEST_CONTEXT = '_requestContext';

@Injectable()
export class InjectUserInterceptor implements NestInterceptor {
  constructor(private type?: NonNullable<'query' | 'body' | 'params'>) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();

    if (this.type && request[this.type]) {
      request[this.type][REQUEST_CONTEXT] = {
        user: request.user,
      };
    }

    return next.handle();
  }
}
```

Now we need to create `src/modules/profile/validators/extended.validation.arguments.ts`:

```typescript
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
```

And now we can make validator itself, `src/modules/profile/validators/UserPasswordCorrect.validator.ts`:

```typescript
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
```

Now add `findUserById` and `updateUser` methods to the `UserService`:

```typescript
...

@Injectable()
export class UserService {
  ...
  /**
   * Find user by id.
   *
   * @param id
   */
  async findUserById(id: string): Promise<User> {
    const user = await this.userRepository.findOneBy({ id });
    return user;
  }

  /**
   * Update given user.
   *
   * @param User user
   */
  async updateUser(user) {
    await this.userRepository.update(user.id, user);
  }

  ...
}

```

Change `profile.module.ts`:

```typescript
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
```

We imported `AuthModule` and added `UserPasswordCorrectValidatorConstraint` as provider.

And we need to export `AuthService` at `auth.module.ts`:

```typescript
...
import { AuthService } from './auth.service';
...

@Module({
  ...
  exports: [AuthService],
})
export class AuthModule {}
```

We need to add pipe `src/base/pipes/strip.request.context.pipe.ts`.

> If we don't do that, our DTO object will contain attached previously request data.

```typescript
import { Injectable, PipeTransform } from '@nestjs/common';
import { omit } from 'lodash';
import { REQUEST_CONTEXT } from '../interceptors/inject.user.interceptor';

@Injectable()
export class StripRequestContextPipe implements PipeTransform {
  transform(value: any) {
    return omit(value, REQUEST_CONTEXT);
  }
}
```

For this one we need lodash:

`npm i lodash`
`npm i --saveDev @types/lodash`

And now our decorators to use at `src/base/decorators/inject.user.decorators.ts`:

```typescript
import { applyDecorators, UseInterceptors, UsePipes } from '@nestjs/common';
import { InjectUserInterceptor } from '../interceptors/inject.user.interceptor';
import { StripRequestContextPipe } from '../pipes/strip.request.context.pipe';

export function InjectUserToQuery() {
  return applyDecorators(InjectUserTo('query'));
}

export function InjectUserToBody() {
  return applyDecorators(InjectUserTo('body'));
}

export function InjectUserToParam() {
  return applyDecorators(InjectUserTo('params'));
}

export function InjectUserTo(context: 'query' | 'body' | 'params') {
  return applyDecorators(
    UseInterceptors(new InjectUserInterceptor(context)),
    UsePipes(StripRequestContextPipe),
  );
}
```

And now we need to change our `ProfileController` to inject user:

```typescript
...
import { InjectUserToBody } from '../../base/decorators/inject.user.decorator';

@Controller('profile')
export class ProfileController {
  ...
  @InjectUserToBody()
  @UseGuards(AuthGuard('jwt'))
  @Post('changePassword')
  async changePassword(
    @Body() changePasswordValidatorDto: ProfileChangePasswordValidatorDto,
    @Request() req,
  ) {
    await this.profileService.changePassword(
      req.user, 
      changePasswordValidatorDto,
    );
  
    return this.profileService.changePasswordResult();
  }
}
```

Oof! 

But have working validator now and know how to inject user from request in custom validator.

Now we have all rules and just need to change password for the user.

To do that we need to change our `ProfileService` class.

```typescript
import { Injectable } from '@nestjs/common';
import { ProfileChangePasswordValidatorDto } from './dto/profileChangePassword.validator.dto';
import { UserService } from '../user/user.service';
import { plainToInstance } from 'class-transformer';
import { ProfileChangePasswordSaveDto } from './dto/profileChangePassword.save.dto';

@Injectable()
export class ProfileService {
  constructor(private userService: UserService) {}

  async changePassword(
    requestUser,
    changePasswordValidatorDto: ProfileChangePasswordValidatorDto,
  ) {
    const user = await this.userService.findUserById(requestUser.id);

    const changePasswordUserJSON = {
      password: changePasswordValidatorDto.newPassword,
    };
    const changePasswordUserSaveDto = plainToInstance(
      ProfileChangePasswordSaveDto,
      changePasswordUserJSON,
    );

    user.password = changePasswordUserSaveDto.password;

    await this.userService.updateUser(user);
  }

  /**
   * Send success message.
   */
  changePasswordResult() {
    return {
      message: 'User password changed successfully',
    };
  }
}
```

The last thing we need is to update `src/base/transformer/trim-string.pipe.ts`:

```typescript
import { AbstractTransformPipe } from './abstract-transform.pipe';

export class TrimStringsPipe extends AbstractTransformPipe {
  except() {
    return [
      'password',
      'passwordCheck',
      'oldPassword',
      'newPassword',
      'newPasswordCheck',
    ];
  }

  protected transformValue(value: any) {
    return typeof value === 'string' ? value.trim() : value;
  }
}
```

And now `profile/changePassword` endpoint is ready!

## Testing
