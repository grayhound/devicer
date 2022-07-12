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
  @HttpCode(200)
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

Again? Yes again! Again and again! We are going to make these tests:

- Check that `changePassword` cannot be accessed without JWT.
- Authenticate user.
- Send empty data.
- Send incorrect `oldPassword`
- Send "correct" `oldPassword` but with spaces.
- Send correct `oldPassword`, but without `newPassword` and `newPasswordCheck`.
- Send correct `oldPassword`, `newPassword` but not `newPasswordCheck`
- Send correct `oldPassword`, `newPasswordCheck` but not `newPassword`
- Send correct `oldPassword`, `newPassword` but `newPasswordCheck` is not equal to `newPassword`.
- Send correct `oldPassword`, `newPassword` and `newPasswordCheck`.
- Try to authenticate with old password.
- Try to authenticate with new password.
- Change password back.

I recommend to make tests inside `test/profile/changePassword` directory. Tests structure should look like endpoints address structure.

`delete.test.ts`:

```typescript
import * as request from 'supertest';

export const ProfileChangePasswordDeleteTest = () => {
  describe('[DELETE] /profile/changePassword endpoint', () => {
    it('must return 404 on DELETE request', async () => {
      const res = await request(global.app.getHttpServer())
        .delete(`${global.prefix}/profile/changePassword`)
        .send();
      expect(res.status).toBe(404);
      expect(res.body.statusCode).toBe(404);
    });
  });
};
```

`get.test.ts`:

```typescript
import * as request from 'supertest';

export const ProfileChangePasswordGetTest = () => {
  describe('[GET] /profile/changePassword endpoint', () => {
    it('must return 404 on GET request', async () => {
      const res = await request(global.app.getHttpServer())
        .delete(`${global.prefix}/profile/changePassword`)
        .send();
      expect(res.status).toBe(404);
      expect(res.body.statusCode).toBe(404);
    });
  });
};
```

`patch.test.ts`:

```typescript
import * as request from 'supertest';

export const ProfileChangePasswordPatchTest = () => {
  describe('[PATCH] /profile/changePassword endpoint', () => {
    it('must return 404 on PATCH request', async () => {
      const res = await request(global.app.getHttpServer())
        .patch(`${global.prefix}/profile/changePassword`)
        .send();
      expect(res.status).toBe(404);
      expect(res.body.statusCode).toBe(404);
    });
  });
}
```

`post.test.ts`, empty for now:

```typescript
import * as request from 'supertest';

export const ProfileChangePasswordPostTest = () => {
};
```

`put.test.js`:

```typescript
import * as request from 'supertest';

export const ProfileChangePasswordPutTest = () => {
  describe('[PUT] /profile/changePassword endpoint', () => {
    it('must return 404 on PUT request', async () => {
      const res = await request(global.app.getHttpServer())
        .put(`${global.prefix}/profile/changePassword`)
        .send();
      expect(res.status).toBe(404);
      expect(res.body.statusCode).toBe(404);
    });
  });
}
```

`changePassword.test.ts`:

```typescript
import { ProfileChangePasswordDeleteTest } from './delete.test';
import { ProfileChangePasswordGetTest } from './get.test';
import { ProfileChangePasswordPatchTest } from './patch.test';
import { ProfileChangePasswordPutTest } from './put.test';
import { ProfileChangePasswordPostTest } from './post.test';

export const ProfileChangePasswordTests = {
  delete: ProfileChangePasswordDeleteTest,
  get: ProfileChangePasswordGetTest,
  patch: ProfileChangePasswordPatchTest,
  put: ProfileChangePasswordPutTest,
  post: ProfileChangePasswordPostTest,
};
```

And connect those tests inside `app.e2e-spec.ts`:

```typescript
...
import { ProfileChangePasswordTests } from './profile/changePassword/changePassword.tests';

...

describe('ProfileChangePasswordTests', () => {
  describe('ProfileChangePasswordGetTest', ProfileChangePasswordTests.get);
  describe('ProfileChangePasswordPostTest', ProfileChangePasswordTests.post);
  describe('ProfileChangePasswordDeleteTest', ProfileChangePasswordTests.delete);
  describe('ProfileChangePasswordPatchTest', ProfileChangePasswordTests.patch);
  describe('ProfileChangePasswordPutTest', ProfileChangePasswordTests.put);
});
```

Add few additions to the `singup.checkups.ts`:

```typescript
  password: {
    ...,
    correctWithSpaces: ' test ',
  },
  ...
  newPassword: {
    correct: 'newPassword',
    incorrect: 'newpassword',
    correctWithSpaces: ' newPassword ',
  },
```

And now to the `post.test.ts`. We will need `SignupCheckups` again.

```typescript
import * as request from 'supertest';
import { SignupCheckups } from '../../_data/signup.checkups';

export const ProfileChangePasswordPostTest = () => {
  const checkUps = SignupCheckups;
  let token;

  describe('[POST] /profile/changePassword endpoint', () => {

  });
};
```

+ Check that `changePassword` cannot be accessed without JWT.

```typescript
    it('must return 401 without token', async () => {
      const res = await request(global.app.getHttpServer())
        .post(`${global.prefix}/profile/changePassword`)
        .send();
      expect(res.status).toBe(401);
    });
```

+ Authenticate user.

```typescript
    it('should authenticate user if everything is correct', async () => {
      const data = {
        email: checkUps.email.correct,
        password: checkUps.password.correct,
      };
      const res = await request(global.app.getHttpServer())
        .post(`${global.prefix}/auth`)
        .send(data);
      expect(res.status).toBe(201);
      expect(res.body).toBeObject();
      expect(res.body).toHaveProperty('token');
      token = res.body.token;
    });
```

+ Send empty data.

```typescript
    it('should return errors without any data sent', async () => {
      const data = {};
      const res = await request(global.app.getHttpServer())
        .post(`${global.prefix}/profile/changePassword`)
        .set('Authorization', `Bearer ${token}`)
        .send(data);
      expect(res.status).toBe(422);
      expect(res.body.statusCode).toBe(422);
      expect(res.body).toHaveProperty('message');
      expect(res.body.message).toBeArray();
      expect(res.body.message).not.toBeEmpty();

      // error for property 'oldPassword' with constraints 'isNotEmpty'
      expect(res.body.message).toIncludeAllPartialMembers([
        {
          property: 'oldPassword',
          constraints: expect.toContainKey('isNotEmpty'),
        },
      ]);

      // error for property 'newPassword' with constraints 'isNotEmpty'
      expect(res.body.message).toIncludeAllPartialMembers([
        {
          property: 'newPassword',
          constraints: expect.toContainKey('isNotEmpty'),
        },
      ]);

      // error for property 'newPasswordCheck' with constraints 'isNotEmpty'
      expect(res.body.message).toIncludeAllPartialMembers([
        {
          property: 'newPasswordCheck',
          constraints: expect.toContainKey('isNotEmpty'),
        },
      ]);
    });
```

+ Send incorrect `oldPassword`

```typescript
    it('should return errors if `oldPassword` is incorrect', async () => {
      const data = {
        oldPassword: checkUps.password.incorrect,
      };
      const res = await request(global.app.getHttpServer())
        .post(`${global.prefix}/profile/changePassword`)
        .set('Authorization', `Bearer ${token}`)
        .send(data);
      expect(res.status).toBe(422);
      expect(res.body.statusCode).toBe(422);
      expect(res.body).toHaveProperty('message');
      expect(res.body.message).toBeArray();
      expect(res.body.message).not.toBeEmpty();

      // error for property 'oldPassword' with constraints 'UserPasswordCorrectValidatorConstraint'
      expect(res.body.message).toIncludeAllPartialMembers([
        {
          property: 'oldPassword',
          constraints: expect.toContainKey(
            'UserPasswordCorrectValidatorConstraint',
          ),
        },
      ]);

      // error for property 'newPassword' with constraints 'isNotEmpty'
      expect(res.body.message).toIncludeAllPartialMembers([
        {
          property: 'newPassword',
          constraints: expect.toContainKey('isNotEmpty'),
        },
      ]);

      // error for property 'newPasswordCheck' with constraints 'isNotEmpty'
      expect(res.body.message).toIncludeAllPartialMembers([
        {
          property: 'newPasswordCheck',
          constraints: expect.toContainKey('isNotEmpty'),
        },
      ]);
    });
```

+ Send "correct" `oldPassword` but with spaces.

```typescript
    it('should return errors if `oldPassword` is "correct" but with spaces', async () => {
      const data = {
        oldPassword: checkUps.password.correctWithSpaces,
      };
      const res = await request(global.app.getHttpServer())
        .post(`${global.prefix}/profile/changePassword`)
        .set('Authorization', `Bearer ${token}`)
        .send(data);
      expect(res.status).toBe(422);
      expect(res.body.statusCode).toBe(422);
      expect(res.body).toHaveProperty('message');
      expect(res.body.message).toBeArray();
      expect(res.body.message).not.toBeEmpty();

      // error for property 'oldPassword' with constraints 'UserPasswordCorrectValidatorConstraint'
      expect(res.body.message).toIncludeAllPartialMembers([
        {
          property: 'oldPassword',
          constraints: expect.toContainKey(
            'UserPasswordCorrectValidatorConstraint',
          ),
        },
      ]);
    });
```

+ Send correct `oldPassword`, but without `newPassword` and `newPasswordCheck`.

```typescript
    it('should return errors if `oldPassword` is correct but no `newPassword` and `newPasswordCheck`', async () => {
      const data = {
        oldPassword: checkUps.password.correct,
      };
      const res = await request(global.app.getHttpServer())
        .post(`${global.prefix}/profile/changePassword`)
        .set('Authorization', `Bearer ${token}`)
        .send(data);
      expect(res.status).toBe(422);
      expect(res.body.statusCode).toBe(422);
      expect(res.body).toHaveProperty('message');
      expect(res.body.message).toBeArray();
      expect(res.body.message).not.toBeEmpty();

      // there should be no errors for `oldPassword`
      expect(res.body.message).not.toIncludeAllPartialMembers([
        {
          property: 'oldPassword',
        },
      ]);

      // error for property 'newPassword' with constraints 'isNotEmpty'
      expect(res.body.message).toIncludeAllPartialMembers([
        {
          property: 'newPassword',
          constraints: expect.toContainKey('isNotEmpty'),
        },
      ]);

      // error for property 'newPasswordCheck' with constraints 'isNotEmpty'
      expect(res.body.message).toIncludeAllPartialMembers([
        {
          property: 'newPasswordCheck',
          constraints: expect.toContainKey('isNotEmpty'),
        },
      ]);
    });
```

+ Send correct `oldPassword`, `newPassword` but not `newPasswordCheck`

```typescript
    it('should return errors if `oldPassword`, `newPassword` is present but not `newPasswordCheck`', async () => {
      const data = {
        oldPassword: checkUps.password.correct,
        newPassword: checkUps.newPassword.correct,
      };
      const res = await request(global.app.getHttpServer())
        .post(`${global.prefix}/profile/changePassword`)
        .set('Authorization', `Bearer ${token}`)
        .send(data);
      expect(res.status).toBe(422);
      expect(res.body.statusCode).toBe(422);
      expect(res.body).toHaveProperty('message');
      expect(res.body.message).toBeArray();
      expect(res.body.message).not.toBeEmpty();

      // there should be no errors for `oldPassword`
      expect(res.body.message).not.toIncludeAllPartialMembers([
        {
          property: 'oldPassword',
        },
      ]);

      // there should be no errors for 'newPassword'
      expect(res.body.message).not.toIncludeAllPartialMembers([
        {
          property: 'newPassword',
        },
      ]);

      // error for property 'newPasswordCheck' with constraints 'isNotEmpty'
      expect(res.body.message).toIncludeAllPartialMembers([
        {
          property: 'newPasswordCheck',
          constraints: expect.toContainKey('isNotEmpty'),
        },
      ]);
    });
```

+ Send correct `oldPassword`, `newPasswordCheck` but not `newPassword`

But before that we need to fix `MatchValidator`! I found an error there!

The thing is that there's no need to check match `newPasswordCheck` if `newPassword` is empty!

Edit `src/base/validators/match.validator.ts`:

```typescript
import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';

export function MatchValidator(
  property: string,
  constraintName?: string,
  validationOptions?: ValidationOptions,
) {
  return (object: any, propertyName: string) => {
    registerDecorator({
      name: constraintName,
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [property],
      validator: {
        validate(value: any, args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints;
          const relatedValue = (args.object as any)[relatedPropertyName];
          if (!relatedValue) {
            return true;
          }
          return value === relatedValue;
        },
        defaultMessage(args: ValidationArguments) {
          return `'${args.property}' field doesn't match '${args.constraints[0]}'`;
        },
      },
    });
  };
}
```

Take a look at lines:

```typescript
          if (!relatedValue) {
            return true;
          }
```

Yes, we just ignore this validator in this case.

And now for the test:

```typescript
    it('should return errors if `oldPassword`, `newPasswordCheck` is present but not `newPassword`', async () => {
      const data = {
        oldPassword: checkUps.password.correct,
        newPasswordCheck: checkUps.newPassword.correct,
      };
      const res = await request(global.app.getHttpServer())
        .post(`${global.prefix}/profile/changePassword`)
        .set('Authorization', `Bearer ${token}`)
        .send(data);
      expect(res.status).toBe(422);
      expect(res.body.statusCode).toBe(422);
      expect(res.body).toHaveProperty('message');
      expect(res.body.message).toBeArray();
      expect(res.body.message).not.toBeEmpty();

      // there should be no errors for `oldPassword`
      expect(res.body.message).not.toIncludeAllPartialMembers([
        {
          property: 'oldPassword',
        },
      ]);

      // error for property 'newPassword' with constraints 'isNotEmpty'
      expect(res.body.message).toIncludeAllPartialMembers([
        {
          property: 'newPassword',
          constraints: expect.toContainKey('isNotEmpty'),
        },
      ]);

      // there should be no errors for 'newPasswordCheck'
      expect(res.body.message).not.toIncludeAllPartialMembers([
        {
          property: 'newPasswordCheck',
        },
      ]);
    });
```

+ Send correct `oldPassword`, `newPassword` but `newPasswordCheck` is not equal to `newPassword`.

```typescript
    it('should return errors if `oldPassword`, `newPassword` and `newPasswordCheck` sent but `newPassword` and `newPasswordCheck` are not equal.', async () => {
      const data = {
        oldPassword: checkUps.password.correct,
        newPassword: checkUps.newPassword.correct,
        newPasswordCheck: checkUps.newPassword.incorrect,
      };
      const res = await request(global.app.getHttpServer())
        .post(`${global.prefix}/profile/changePassword`)
        .set('Authorization', `Bearer ${token}`)
        .send(data);
      expect(res.status).toBe(422);
      expect(res.body.statusCode).toBe(422);
      expect(res.body).toHaveProperty('message');
      expect(res.body.message).toBeArray();
      expect(res.body.message).not.toBeEmpty();

      // there should be no errors for `oldPassword`
      expect(res.body.message).not.toIncludeAllPartialMembers([
        {
          property: 'oldPassword',
        },
      ]);

      // there should be no errors for 'newPassword'
      expect(res.body.message).not.toIncludeAllPartialMembers([
        {
          property: 'newPassword',
        },
      ]);

      // error for property 'newPasswordCheck' with constraint 'isNotEmpty'
      expect(res.body.message).toIncludeAllPartialMembers([
        {
          property: 'newPasswordCheck',
          constraints: expect.toContainKey('PasswordsMatch'),
        },
      ]);
    });
```

+ Send correct `oldPassword`, `newPassword` but `newPasswordCheck` is with spaces.

```typescript
    it('should return errors if `oldPassword`, `newPassword` and `newPasswordCheck` sent but `newPaswordCheck` with spaces', async () => {
      const data = {
        oldPassword: checkUps.password.correct,
        newPassword: checkUps.newPassword.correct,
        newPasswordCheck: checkUps.newPassword.correctWithSpaces,
      };
      const res = await request(global.app.getHttpServer())
        .post(`${global.prefix}/profile/changePassword`)
        .set('Authorization', `Bearer ${token}`)
        .send(data);
      expect(res.status).toBe(422);
      expect(res.body.statusCode).toBe(422);
      expect(res.body).toHaveProperty('message');
      expect(res.body.message).toBeArray();
      expect(res.body.message).not.toBeEmpty();

      // there should be no errors for `oldPassword`
      expect(res.body.message).not.toIncludeAllPartialMembers([
        {
          property: 'oldPassword',
        },
      ]);

      // there should be no errors for 'newPassword'
      expect(res.body.message).not.toIncludeAllPartialMembers([
        {
          property: 'newPassword',
        },
      ]);

      // error for property 'newPasswordCheck' with constraint 'isNotEmpty'
      expect(res.body.message).toIncludeAllPartialMembers([
        {
          property: 'newPasswordCheck',
          constraints: expect.toContainKey('PasswordsMatch'),
        },
      ]);
    });
```

+ Send correct `oldPassword`, `newPassword` and `newPasswordCheck`.

```typescript
    it('should change password with correct data', async () => {
      const data = {
        oldPassword: checkUps.password.correct,
        newPassword: checkUps.newPassword.correct,
        newPasswordCheck: checkUps.newPassword.correct,
      };
      const res = await request(global.app.getHttpServer())
        .post(`${global.prefix}/profile/changePassword`)
        .set('Authorization', `Bearer ${token}`)
        .send(data);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('message');
    });
```

+ Try to authenticate with old password.

```typescript
    it('should not authenticate with old password', async () => {
      const data = {
        email: checkUps.email.correct,
        password: checkUps.password.correct,
      };
      const res = await request(global.app.getHttpServer())
        .post(`${global.prefix}/auth`)
        .send(data);
      expect(res.status).toBe(401);
      token = res.body.token;
    });
```

+ Try to authenticate with new password.

```typescript
    it('should authenticate with new password', async () => {
      const data = {
        email: checkUps.email.correct,
        password: checkUps.newPassword.correct,
      };
      const res = await request(global.app.getHttpServer())
        .post(`${global.prefix}/auth`)
        .send(data);
      expect(res.status).toBe(201);
      expect(res.body).toBeObject();
      expect(res.body).toHaveProperty('token');
      token = res.body.token;
    });
```

+ Change password back.

```typescript
    it('should change password back', async () => {
      const data = {
        oldPassword: checkUps.newPassword.correct,
        newPassword: checkUps.password.correct,
        newPasswordCheck: checkUps.password.correct,
      };
      const res = await request(global.app.getHttpServer())
        .post(`${global.prefix}/profile/changePassword`)
        .set('Authorization', `Bearer ${token}`)
        .send(data);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('message');
    });
```

 √ 57 passed, 57 total!
