## Change password.

You may ask why the hell do you need a chapter about `Change Password`.

That should be simple one?

Not with NestJS, unfortunately. 

To change password we need 3 fields:
- old password
- new password
- new password check

It's quite obvious how DTO should work with `new password` and `new password check`.

But when it comes to checking the `old password` we are a getting a problem.

We are using `@UseGuards(AuthGuard('jwt'))` for profile controller and with help of it we can get user from request.

It will be the same way for `change password`. I was hoping that I will just get user from request in custom validator and compare user inputted password.

The problem is - we cannot inject `Request` object into the custom validator.

[Dev's explain it this way.](https://github.com/nestjs/nest/issues/1955#issuecomment-481991787)

Welp, I can understand that. 

But we still can inject Services to the custom validators, so this limitation seems strange to me.

Thankfully I found an article [Injecting request object to a custom validation class in NestJS](https://dev.to/avantar/injecting-request-object-to-a-custom-validation-class-in-nestjs-5dal)

We will try to implement that solution here.


Create `validator` and `save` DTO's.

Create `/src/modules/profile/dto/profileChangePassword.validator.dto.ts`:

```typescript
import { IsNotEmpty } from 'class-validator';
import { MatchValidator } from '../../../base/validators/match.validator';

/**
 * DTO to validate data for password change.
 */
export class ProfileChangePasswordValidatorDto {
  @IsNotEmpty()
  password: string;

  @MatchValidator('password', 'PasswordsMatch')
  @IsNotEmpty()
  passwordCheck: string;
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
