# Create REST API authentication via JWT (JSON Web Token)

## Some preparations

For authentication we are going to use JSON Web Token.

The whole idea behind it that you don't need to store any tokens in the database. You generate it, pass to the user and authenticate user next time with given token.

> Note: JWT must be short-living. 30 minutes for main token and hour for refresh token will be enough.

First, install dependencies:

`npm i --save @nestjs/jwt @nestjs/passport passport passport-jwt`
`npm i --save-dev @types/passport-jwt`

Now, we need to generate module, controller and service for `auth` endpoint:

`nest g module modules/auth`
`nest g controller modules/auth`
`nest g service modules/auth` 

Again, we need to validate incoming data. Lets create a DTO to validate authentication data.

You need to create `src/modules/auth/dto/authUser.validator.dto.ts`:

```typescript
import { IsEmail, IsNotEmpty } from 'class-validator';

export class AuthUserValidatorDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  password: string;
}

```

This validator is simpler than `SignupUserValidatorDto`, we just need to check out that user entered valid `email` and `password` field is not empty too.

We need to normalize email before sending in to the database. 

That's why we need `src/modules/auth/dto/authUser.save.dto.ts`:

```typescript
import { Transform } from 'class-transformer';
import normalizeEmail from 'validator/lib/normalizeEmail';

/**
 * This is a DTO that converts incoming validated data.
 * Here we just normalize `email` field
 */
export class AuthUserSaveDto {
  // normalize email
  @Transform(({ value }) => normalizeEmail(value))
  email: string;

  password: string;
}
```

Lets also prepare a result dto `src/modules/auth/dto/authUser.result.dto.ts`:

```typescript
export class AuthUserResultDto {
  token: string;
}
```

We will return only `token` field.

Now, create skeleton for controller:

```typescript
import { Body, Controller, Post } from '@nestjs/common';
import { AuthUserValidatorDto } from './dto/authUser.validator.dto';
import { AuthUserResultDto } from './dto/authUser.result.dto';

@Controller('auth')
export class AuthController {
  @Post()
  async auth(@Body() authUserDto: AuthUserValidatorDto) {
    return {};
  }
}
```

We will add types later on, for now we need it just working and returning empty JSON object. 

You can run dev server and check that `/v1/auth` endpoint in running and validates data.

The next step is to update controller and service and find user. 

## But before that - a little bit a refactoring.

You look at the `SignupService` class you will find `findUserByEmail` method we wrote before.

But also need it for the `AuthService`. The best solution is to move this method from `SignupService` to `UserService` class.

Edit `src/modules/user/user.service.ts`:

```typescript
import { Injectable } from '@nestjs/common';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) public readonly userRepository: Repository<User>,
  ) {}

  /**
   * Find user by email.
   *
   * @param email
   */
  async findUserByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findOneBy({ email });
    return user;
  }
}
```

As you can see we make `userRepository` in the constructor public. This way we can access `userRepository` via `UserService` class.

Remove `findUserByEmail` method from `SignupService` class.

Now, `SignupService` should connect `UserService`.

To do this, edit `src/modules/signup/signup.service.ts`. Find `constructor` there:

```typescript
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}
```

Change it to:

```typescript
  constructor(private readonly userService: UserService) {}
```

Now we need to access `userRepository` via `userService` variable.

Inside `src/modules/signup/signup.service.ts` find string:

`const user = await this.userRepository.save(signupUserSaveDto);`

and change it to:

`const user = await this.userService.userRepository.save(signupUserSaveDto);`

Unfortunatelly, that's not all. `UserService` is not ready to use yet. We must prepare the module first.

You need to make `src/modules/user/user.module.ts` to look like this:

```typescript
import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UserController],
  providers: [UserService],
  exports: [TypeOrmModule, UserService],
})
export class UserModule {}
```

The main line is `exports: [TypeOrmModule],`. Here we tell module to export all TypeOrmModules that were... imported into `UserModule`.

Now, in order to have access to `userService` and `userRepository` we should import `UserModule` inside `AuthModule` and `SignupModule`.

Edit `src/modules/signup/signup.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { SignupController } from './signup.controller';
import { SignupService } from './signup.service';
import { UserEmailUniqueConstraint } from './validators/UserEmailUnique.validator';
import { UserModule } from '../user/user.module';

@Module({
  imports: [UserModule],
  controllers: [SignupController],
  providers: [SignupService, UserEmailUniqueConstraint],
})
export class SignupModule {}
```

And now `src/modules/auth/auth.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserModule } from '../user/user.module';

@Module({
  imports: [UserModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
```

And now beginning of `AuthService` at `src/modules/auth/auth.service.ts`:

```typescript
import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
  constructor(private readonly userService: UserService) {}
}
```

> Confused a little? So was I. Actually it's easy as pie.
> 
> We need to access `UserService` from `AuthService` and `SignupService`.
>
> `UserService` should be a provider at both `SignupService` and `AuthService`.
> 
> That's why we need export `UserService` at `UserModule`. In this case we will be able to use `UserService` inside our modules.
>
> Same goes with `TypeOrmModule` export. 
>
> Now we need to import just `UserModule` in any other module we want and we will have access to the `UserService` and `userRepository` inside it.

Remember `UserEmailUniqueConstraint` we used to check for duplicate emails? We need to fix it for `UserService`.

Edit `src/modules/signup/validators/UserEmailUnique.validator.ts`, find line:

Remove line:
`import { SignupService } from '../signup.service';`

change it to:

`import { UserService } from '../../user/user.service';`

to import `UserService`.

Then find:

`constructor(private signupService: SignupService) {}`

change to:

`constructor(private userService: UserService) {}`

So we can access `UserService` in this validator now.

And finally find:

`const user = await this.signupService.findUserByEmail(normalizedEmail);`

and change it to:

`const user = await this.userService.findUserByEmail(normalizedEmail);`

## Testing!

We did some changes. But did we break anything? We can check it with tests.

Run docker test environment and then run `npm run test:e2e`.

You got all green checkmarks? That means that our `/signup` still works correctly!

## Continue delepoment

We need to update `AuthController` at `/src/modules/auth/auth.controller.ts`:

```typescript
import { Body, Controller, HttpException, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { AuthUserValidatorDto } from './dto/authUser.validator.dto';
import { AuthUserResultDto } from './dto/authUser.result.dto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post()
  async auth(@Body() authUserDto: AuthUserValidatorDto): Promise<AuthUserResultDto> {
    const authData = await this.authService.tryAuthenticate(authUserDto);

    // if no auth data is returned - this means that user cannot be authenticated
    if (!authData) {
      throw new HttpException(
        {
          status: HttpStatus.UNAUTHORIZED,
          error:
            'Cannot authenticate user. Please check `email` and `password`',
        },
        HttpStatus.UNAUTHORIZED);
    }
    return authData;
  }
}
```

Here we will try to authenticate our user. If no data is returned - we will just return error with 401 Http status.

No for the serivce `AuthService` at `/src/modules/auth/auth.service.ts`:

```typescript
import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { AuthUserValidatorDto } from './dto/authUser.validator.dto';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import { AuthUserSaveDto } from './dto/authUser.save.dto';
import { AuthUserResultDto } from './dto/authUser.result.dto';
import * as bcrypt from 'bcrypt';
import { User } from '../user/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  /**
   * Try to authenticate user with email and password.
   *
   * @param AuthUserValidatorDto authUserDto
   */
  async tryAuthenticate(
    authUserDto: AuthUserValidatorDto,
  ): Promise<AuthUserResultDto> {
    // first we need to normalize email
    const authUserSaveDto = this.prepareAuthSaveDto(authUserDto);
    const user = await this.userService.findUserByEmail(authUserSaveDto.email);
    // if user not found - return null
    if (!user) {
      return null;
    }

    // now we need to check password
    const passwordCheck = await this.checkPassword(user, authUserDto.password);
    if (!passwordCheck) {
      return null;
    }

    const result: AuthUserResultDto = {
      token: this.generateJWT(user),
    };

    return result;
  }

  /**
   * Format incoming validated data.
   *
   * @param authUserDto
   */
  prepareAuthSaveDto(authUserDto: AuthUserValidatorDto): AuthUserSaveDto {
    const authUserJSON = instanceToPlain(authUserDto);
    const result: AuthUserSaveDto = plainToInstance(
      AuthUserSaveDto,
      authUserJSON,
    );
    return result;
  }

  /**
   * Check that inputed password for the user is correct.
   *
   * @param user
   * @param password
   */
  async checkPassword(user: User, password: string) {
    const result = await bcrypt.compare(password, user.password);
    return result;
  }

  /**
   * Generate Json Web Token for user.
   *
   * @param user
   */
  generateJWT(user: User): string {
    const payload = { email: user.email, sub: user.id };
    return this.jwtService.sign(payload);
  }
}
```

Simple. We prepare data for the database using `AuthUserSaveDTO`. Then we try to find user by email.

If user is available - check his passwords. 

And, if passsword is correct, generate JWT.

Don't forget to update `AuthModule`:

```typescript
import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserModule } from '../user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    UserModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('jwt').secret,
        signOptions: {
          expiresIn: configService.get('jwt').expiresIn,
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}

```

Here we register `JwtModule` as in imports to use it as `JwtService`

As you can see, we are using `registerAsync` to inject `ConfigService` and use parameters from our configs.

Need to add new parameter to the configs.

Edit `/src/config/envs/dev/app.config.ts`:

```typescript
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.dev' });

import postgresConfig from './postgresql.config';

/**
 * Getting configuration data.
 */
export default () => ({
  // api settings
  api: {
    port: parseInt(process.env.DEVICER_API_PORT, 10) || 3000,
  },

  // postgress database setting
  postgres: postgresConfig,

  jwt: {
    secret: process.env.DEVICER_JWT_SECRET || 'somerandomjwtsecret',
    expiresIn: process.env.DEVICER_JWT_EXPIRES_IN || '30m',
  },
});
```

The new part is `jwt` section.

And don't forget about `/src/config/envs/test/app.config.ts`:

```typescript
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.test' });

import postgresConfig from './postgresql.config';

/**
 * Getting configuration data for testing.
 */
export default () => ({
  // api settings
  api: {
    port: parseInt(process.env.DEVICER_API_PORT, 10) || 5012,
  },

  // postgress database setting
  postgres: postgresConfig,

  jwt: {
    secret: process.env.DEVICER_JWT_SECRET || 'somerandomjwtsecret',
    expiresIn: process.env.DEVICER_JWT_EXPIRES_IN || '30m',
  },
});
```

There are 2 new environment variables: `DEVICER_JWT_SECRET` and `DEVICER_JWT_EXPIRES_IN`.

You need to set them into `.env.dev` and `.env.test` files:

`.env.dev` should now look like this:

```
DEVICER_API_PORT=3000

DEVICER_POSTGRES_HOST=localhost
DEVICER_POSTGRES_PORT=5432
DEVICER_POSTGRES_USER=devicer
DEVICER_POSTGRES_PASSWORD=devicer
DEVICER_POSTGRES_DB=devicer

DEVICER_JWT_SECRET=jD2nWjXwE2B6ewBxMpqumuJVCD5Cxbu2PuGTNQL7aQvemFvKm3BX24S6bb4879Vc
DEVICER_JWT_EXPIRES_IN=30m
```

and `.env.test`:

```
DEVICER_API_PORT=5012

DEVICER_POSTGRES_HOST=localhost
DEVICER_POSTGRES_USER=devicer_test
DEVICER_POSTGRES_DB=devicer_test
DEVICER_POSTGRES_PASSWORD=devicer_test
DEVICER_POSTGRES_PORT=5433
DEVICER_POSTGRES_PGDATA=/data/postgres

DEVICER_JWT_SECRET=Qy6sVDHTwUq25LPkeYtpub2eEHDvTq8NYcx7ch3PUdXM7MBVe3EyV4h2G7fQ8f5b
DEVICER_JWT_EXPIRES_IN=30m
```

> Never expose your secret keys in production! Remember - this is just a tutorial.

Now you can send `email` and `password` as JSON to the `/v1/auth` endpoint.

You should send like this:

```json
{
    "email": "test@test.com",
    "password": "test"
}
```

If user exists and password is correct, you will recieve correct response with JWT:

```json
{
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFAYS5jb20iLCJzdWIiOiI2NmI2NGFmNi1kY2I2LTRkN2QtYjQzOC02MjkxODFlNzU2YTYiLCJpYXQiOjE2NTY5NDEzMDgsImV4cCI6MTY1Njk0MzEwOH0.mvlZXBCWhI_iX8RKs7Yxc9HC4vEgBt4xjr6sl4u5Hpk"
}
```

## Implement JWT

User can request token and we can check this token on other endpoints.

Lets create and easy one - `profile`. We will just authenticate user via JWT and return profile information. In this case - just email and originalEmail will be enough.


