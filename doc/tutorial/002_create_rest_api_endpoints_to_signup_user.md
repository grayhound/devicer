# 2. Create REST API endpoints to signup user

## Create new modules

We have everything ready to start making our own modules.

Let's create new resource using nest. We need a resource `User`. Run command:

`nest g res modules/user`

This will generate default CRUD structure for User.

For good practice I also recommend to generate separate module `signup` and controller for `/v1/signup`

`nest g module modules/signup`
`nest g controller modules/signup`
`nest g service modules/signup`

> It should a good practice to create new modules inside `modules` directory to separate them from all other code.

## Create new entity.

Now, we can create `User` entity.

But first, let's create basic abstract class for entities. We will extend other entities based on this one.

Create directory `src/base` and then create `base.entity.ts`:

```typescript
import {
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  CreateDateColumn,
} from 'typeorm';

export abstract class BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createDateTime: Date;

  @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  updateDateTime: Date;
}
```

> A little bit of information, hope it will be interesting to you.
> 
> Here you can see `@PrimaryGeneratedColumn('uuid')`. 
>
> Unfortunately it will generate random constraint name for this `Primary Key`. The name will be something like `PK_a3ffb1c0c8416b9fc6f907b7433`
>
> Database Architect (DBA) won't like it all. With TypeORM 0.3.6 there's no way to set this name by hand.
>  
> Fortunately, there's a good pool request which is already merged - [https://github.com/typeorm/typeorm/pull/8900](https://github.com/typeorm/typeorm/pull/8900)
>
> Let's hope to see this in future versions. 

All our entities will have: 
- primary id field (based on UUID)
- createdDateTime - this will show object creation datetime in database.
- updateDateTime - object update datetime  

Now, edit `src/modules/user/entities/user.entity.ts`:

```typescript
import { Entity, Column, Index, Unique } from 'typeorm';
import { BaseEntity } from '../../../base/base.entity';

@Entity({
  name: 'users',
})
@Unique('user_email_unique_cons', ['email'])
export class User extends BaseEntity {
  @Column({
    length: 255,
  })
  @Index('user_email_idx')
  email: string;

  @Column({
    name: 'password',
    length: 255,
  })
  password: string;

  @Column({
    length: 255,
  })
  emailOriginal: string;
}

```

Here we can see fields:
- email, which is unique and indexed
- password - here we will save password hash
- emailOriginal - this one will save original input of email by user. 
User may prefer to input 'Email@email.com', but we will normalize it to 'email@email.com' for `email` field and save original input by user for `emailOriginal` field.

Right now we have a User entity ready but schema is not in the database yet. 

## Migrations

This is were database migrations come to aid! 

> Please note, this tutorial is made with TypeORM 0.3.6
>
> TypeORM is under constant development and some things are slightly different from version to version
>
> Unfortunately TypeORM docs can be outdated in some minor things
>
> Just use --help for typeorm cli to get correct parameters.

We need a correct DataSource to use typeorm cli commands. 

Create file `src/config/envs/dev/typeorm.datasource.ts` file:

```typescript
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.dev' });

import { DataSource, DataSourceOptions } from 'typeorm';

import postgresConfig from './postgresql.config';

const postgresDSO: DataSourceOptions = <DataSourceOptions>postgresConfig;

const AppDataSource = new DataSource(postgresDSO);

export default AppDataSource;

```

As you can see we are using `postgresql.config.ts` again and don't duplicate configuration files.

The main command for typeorm cli is:

`npx typeorm-ts-node-commonjs`

To generate new migration you should run:

`npx typeorm-ts-node-commonjs migration:generate src/migrations/UserInit -d src/config/envs/dev/typeorm.datasource.ts`

Here, `src/migrations/UserInit` is a path/filename for our new migration. `-d` parameter is path to our config with DataSource.

We have migration file now and can just run:

`npx typeorm-ts-node-commonjs migration:run -d src/config/envs/dev/typeorm.datasource.ts`

Voila! Changes are in the database now! Go check it with pgAdmin! You will see new tables. 

> Each time you make changes to the entities you should generate and run migrations
>
> Migrations is the best way to update database schema. Especially in production environment.

## Basic validation

All incoming data should be validated.

Let's discuss is a little bit.

To signup user in our case we need 3 fields:

- email
- password
- passwordCheck

We can't just pass that data without any validation. We need to check those fields with these rules:

1. `email` field cannot be empty
2. `email` should be correct email
3. `email` should be unique in the database
4. `password` field cannot be empty
5. `passwordCheck` field cannot be empty
6. `password` and `passwordCheck` must be identical

With help of NestJS we can validate incoming data!

You can get some information on validation at NestJS here - [https://docs.nestjs.com/techniques/validation](https://docs.nestjs.com/techniques/validation) 

We need to install additional dependencies to check and sanitize/filter incoming data.

`npm i --save class-validator class-transformer validator`

Now it's time to connect validation pipe. 

Edit `main.ts` file to look like this:

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe, VersioningType } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.useGlobalPipes(new ValidationPipe());

  app.enableVersioning({
    defaultVersion: '1',
    type: VersioningType.URI,
  });
  await app.listen(configService.get('api').port);
}

bootstrap();
```

The main thing here is string `app.useGlobalPipes(new ValidationPipe({ stopAtFirstError: true }));`

If user will enter some invalid data he will get a 400 error with this body:

```json
{
    "statusCode": 400,
    "message": [
        "email must be an email",
        "password should not be empty",
        "passwordCheck should not be empty"
    ],
    "error": "Bad Request"
}
```

> A little thought from me. First, we get error `400 Bad Request`.
> 
> Before I started learning NestJS and writing this tutorial I had couple projects based on ExpressJS only.
>
> If data was invalid my application returned `422 Unprocessable Entity` which seems more suitable.
>
> Second problem - as you can see we have error messages. The problem is that we can't say for sure what field got specific error. We can guess, but guessing is wrong here.
>
> We will change that a little bit later. 

Before we start validating data I want to show some good trick.

I hope there's no need to tell you about trimming `space` characters from input data. This is a rare occasion but it's possible.

Why bother user if we can trim that data for every field. Every, except `password` and `passwordCheck`.

To cover this case we need to create a transformer that will be added as a `Global Pipe` to NestJS.

I got this idea from one of the NestJS boilerplates [https://github.com/Vivify-Ideas/nestjs-boilerplate](https://github.com/Vivify-Ideas/nestjs-boilerplate)

This boilerplate is good. Unfortunately it uses outdated TypeORM 0.2.x

But the idea of global trimming (and global transforming too) is still good and we will use it.

First, create `src/base/transformer/abstract-trasnform.pipe.ts`:

```typescript
import { PipeTransform, ArgumentMetadata } from '@nestjs/common';

export abstract class AbstractTransformPipe implements PipeTransform {
  protected abstract transformValue(value: any): any;

  protected except(): string[] {
    return [];
  }

  private isObject(value: any): boolean {
    return typeof value === 'object' && value !== null;
  }

  private transformObject(values) {
    Object.keys(values).forEach((key) => {
      if (this.except().includes(key)) {
        return;
      }

      if (this.isObject(values[key])) {
        values[key] = this.transformObject(values[key]);
      } else {
        values[key] = this.transformValue(values[key]);
      }
    });
    return values;
  }

  transform(values: any, metadata: ArgumentMetadata) {
    const { type } = metadata;
    if (this.isObject(values) && type === 'body') {
      return this.transformObject(values);
    }
    return values;
  }
}
```

With this abstract class we can create global transformer pipes!

And now we need to create transformer pipe `src/base/transformer/trim-strings.pipe.ts` that will trim incoming data:

```typescript
import { AbstractTransformPipe } from './abstract-transform.pipe';

export class TrimStringsPipe extends AbstractTransformPipe {
  except() {
    return ['password', 'passwordConfirmation'];
  }

  protected transformValue(value: any) {
    return typeof value === 'string' ? value.trim() : value;
  }
}
```

And now edit `src/main.ts` file. Here you should change one string:

```typescript
app.useGlobalPipes(new ValidationPipe());
```

to: 

```typescript
app.useGlobalPipes(new TrimStringsPipe(), new ValidationPipe());
```

Now, lets add some changes to return error 422 and descriptive errors. Here's how main.ts will now look like:

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import {
  UnprocessableEntityException,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import { TrimStringsPipe } from './base/transformer/trim-strings.pipe';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.useGlobalPipes(
    new TrimStringsPipe(),
    new ValidationPipe({
      stopAtFirstError: true,
      validationError: {
        target: false,
      },
      exceptionFactory: (errors) => new UnprocessableEntityException(errors),
    }),
  );

  app.enableVersioning({
    defaultVersion: '1',
    type: VersioningType.URI,
  });

  await app.listen(configService.get('api').port);
}

bootstrap();
```

Alright, we have data sanitized. Now let's validate it.

Create file `src/modules/signup/dto/signupUser.validator.dto.ts`

```typescript
import { IsEmail, IsNotEmpty } from 'class-validator';

export class SignupUserValidatorDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  password: string;

  @IsNotEmpty()
  passwordCheck: string;
}
```

Right now it doesn't affect all the rules we need but enough for us to test.

Use `Postman` to send POST request `http://localhost:3000/v1/signup/` with empty data.

You will get an 422 error looking like this:

```json
{
    "statusCode": 422,
    "message": [
        {
            "property": "email",
            "children": [],
            "constraints": {
                "isNotEmpty": "email should not be empty"
            }
        },
        {
            "property": "password",
            "children": [],
            "constraints": {
                "isNotEmpty": "password should not be empty"
            }
        },
        {
            "property": "passwordCheck",
            "children": [],
            "constraints": {
                "isNotEmpty": "passwordCheck should not be empty"
            }
        }
    ],
    "error": "Unprocessable Entity"
}
```

## Unique email validation

Now we are coming to the part where we will create custom validation rule.

First, we need to update `src/main.ts`.

Add this:

```typescript
useContainer(app.select(AppModule), { fallbackOnErrors: true });
```

right after: 

```typescript
const configService = app.get(ConfigService);
```

This will enable using our custom validators.

Now, create file `src/modules/signup/validators/UserEmailUnique.validator.ts`:

```typescript
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

  async validate(value: string) {
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
```

I hope this is quite self-explanatory. We use async method `validate` to find user with this email.

If user already exists - we return `false` and endpoint will return an error for `email` field.

Now, as you can see, we have new method `findUserByEmail` for `Signup Service`.

Let's edit `src/signup/signup.service.ts`:

```typescript
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class SignupService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
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

The last step - we need to update `src/modules/signup/signup.module.ts` to include our new constraint as provider:

```typescript
import { Module } from '@nestjs/common';
import { SignupController } from './signup.controller';
import { SignupService } from './signup.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { UserEmailUniqueConstraint } from './validators/UserEmailUnique.validator';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [SignupController],
  providers: [SignupService, UserEmailUniqueConstraint],
})
export class SignupModule {}
```

## Checking passwords

Now we need custom validator that will check that passwords are equal.

Create file `src/modules/signup/validators/match.validators.ts`:

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
          return value === relatedValue;
        },
        defaultMessage(args: ValidationArguments) {
          return `'${args.property}' field doesn't match '${args.constraints[0]}'`;
        }
      }
    });
  };
}
```

Now we must add this validator to the `src/modules/singup/dto/signupUser.validator.dto.ts`:

```typescript
import { IsEmail, IsNotEmpty, Validate } from 'class-validator';
import { UserEmailUniqueValidator } from '../validators/UserEmailUnique.validator';
import { MatchValidator } from '../validators/match.validator';

export class SignupUserValidatorDto {
  @UserEmailUniqueValidator()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  password: string;

  @MatchValidator('password', 'PasswordsMatch') // here's the the addition
  @IsNotEmpty()
  passwordCheck: string;
}
```

If passwords are different, you will get error like this:

```json
{
    "statusCode": 422,
    "message": [
        {
            "value": "Test",
            "property": "passwordCheck",
            "children": [],
            "constraints": {
                "PasswordsMatch": "'passwordCheck' field doesn't match 'password'"
            }
        }
    ],
    "error": "Unprocessable Entity"
}
```

`MatchValidator` is quite unique and can be used with any field to compare to any other field.

More than that, you can use this validator as many times as you want on any field.

For example:

```typescript
import { IsEmail, IsNotEmpty } from 'class-validator';
import { UserEmailUniqueValidator } from '../validators/UserEmailUnique.validator';
import { MatchValidator } from '../validators/match.validator';

export class SignupUserValidatorDto {
  @UserEmailUniqueValidator()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  password: string;
  
  @MatchValidator('email', 'EmailMatch') // here's the the addition
  @MatchValidator('password', 'PasswordsMatch') // here's the the addition  
  @IsNotEmpty()
  passwordCheck: string;
}
```

This is really stupid example but if you will use `stopAtFirstError: false` at main.ts, you will see two different errors for `passwordMatch` field.

Error will look something like this:

```json
{
    "statusCode": 422,
    "message": [
        {
            "value": "Test",
            "property": "passwordCheck",
            "children": [],
            "constraints": {
                "PasswordsMatch": "'passwordCheck' field doesn't match 'password'",
                "EmailMatch": "'passwordCheck' field doesn't match 'email'"
            }
        }
    ],
    "error": "Unprocessable Entity"
}
``` 

Same validator used twice will return two different `constraints`. All you have to do is to change second parameter for `MatchValidator` `Dependency Injection`.

> This is just an example, but it can be possible that you would like to check one value with 2+ others.

## Signup user already!

But before we continue, lets checkup ourselves.

So, we had these validators:

1. `email` field cannot be empty - check! Thank you, `@IsNotEmpty()` DI!
2. `email` should be correct email - check! Thank you, `@IsEmail()` DI!
3. `email` should be unique in the database - check! Our custom `@UserEmailUniqueValidator` comes to help. 
4. `password` field cannot be empty - check! `@IsNotEmpty` once again!
5. `passwordCheck` field cannot be empty - check! `@IsNotEmpty` once again!
6. `password` and `passwordCheck` must be identical - check! Our `@MatchValidator` help with it.

This means that we checked all incoming data and now we can finally signup our user!

We will need new package to hash passwords. Install it with command:

`npm i bcrypt`

Now, lets create couple of new DTOs.

First, create `src/modules/signup/dto/signupUser.save.dto.ts`:

```typescript
import { Exclude, Transform } from 'class-transformer';
import * as bcrypt from 'bcrypt';
import normalizeEmail from 'validator/lib/normalizeEmail';

/**
 * This is a DTO that converts incoming validated data.
 * Here we hide `passwordCheck`, hash `password` field, normalize `email` field
 */
export class SignupUserSaveDto {
  // normalize email
  @Transform(({ value }) => normalizeEmail(value))
  email: string;

  emailOriginal: string;

  // hash password. Never save plaing passwords!
  @Transform(({ value }) => bcrypt.hashSync(value, 12))
  password: string;

  // we don't need to save this field, so we are excluding it from result.
  @Exclude()
  passwordCheck: string;
}
```

As you can see, this DTO normalizes `email`, hashes `password` and hides `passwordCheck` field.

We will need another DTO to return result. Create `src/modules/signup/dto/signupUser.result.dto.ts`:

```typescript
import { Exclude } from 'class-transformer';

export class SignupUserResultDto {
  @Exclude()
  id: string;

  email: string;

  @Exclude()
  emailOriginal: string;

  @Exclude()
  password: string;

  @Exclude()
  passwordCheck: string;

  @Exclude()
  createDateTime: string;

  @Exclude()
  updateDateTime: string;
}
```

Here we exclude most fields and show only `email`.

Now we should update our controller `src/modules/signup/signup.controller.ts`:

```typescript
import { Body, Controller, Post } from '@nestjs/common';
import { SignupService } from './signup.service';
import { SignupUserValidatorDto } from './dto/signupUser.validator.dto';
import { SignupUserResultDto } from './dto/signupUser.result.dto';

@Controller('signup')
export class SignupController {
  constructor(private readonly signupService: SignupService) {}
  
  @Post()
  async create(@Body() signupUserDto: SignupUserValidatorDto): Promise<SignupUserResultDto> {
    // incoming data is validated. Now we can signup user!
    const newUser = await this.signupService.signup(signupUserDto);

    // let's prepare data to return
    const result = this.signupService.signupResult(newUser);
    return result;
  }
}
```

Easy as pie! Here we use `SignupService`.`signup` and `SignupService`.`signupResult` methods. Yes, they don't exist yet. 

Lets update `SignupService`! Edit `src/modules/signup/signup.service.ts` to look like this:

```typescript
import { Injectable } from '@nestjs/common';
import { SignupUserValidatorDto } from './dto/signupUser.validator.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { Repository } from 'typeorm';
import { SignupUserSaveDto } from './dto/signupUser.save.dto';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import { SignupUserResultDto } from './dto/signupUser.result.dto';

@Injectable()
export class SignupService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
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

  /**
   * Signup user.
   *
   * @param signupUserDto
   */
  async signup(
    signupUserDto: SignupUserValidatorDto,
  ): Promise<SignupUserSaveDto> {
    // first we need to make our signupUserDto a plain JSON object
    const signupUserJSON = instanceToPlain(signupUserDto);
    // set up `emailOriginal` field
    signupUserJSON.emailOriginal = signupUserDto.email;
    // now we can convert it to the SignupUserSaveDto object
    // by doing this we manipulate data to save it correctly.
    const signupUserSaveDto = plainToInstance(
      SignupUserSaveDto,
      signupUserJSON,
    );

    // finally we can save user!
    const user = await this.userRepository.save(signupUserSaveDto);

    return user;
  }

  /**
   * Convert SignupUserSaveDto to SignupUserResultDto.
   * We need to hide some data. We don't need to show our hashed password.
   *
   * @param newUser
   */
  signupResult(newUser: SignupUserSaveDto): SignupUserResultDto {
    const newUserJson = instanceToPlain(newUser);
    const result = plainToInstance(SignupUserResultDto, newUserJson);
    return result;
  }
}
```

You can see two new methods - `signup` and `signupResult`.

`signup` converts incoming data to `signupUserSaveDto` and then saves it via `UserRepository`.

`signupResult` method just converts `SignupUserSaveDto` to `SignupUserResultDto`. 

Now you can make a POST to the `http://localhost:3000/v1/signup/` with JSON like this:

```json
{
    "email": "Test@test.com",
    "password": "test",
    "passwordCheck": "test"
}
```

User is saved in the database!

If you will try this request again, you will get an error:

```json
{
    "statusCode": 422,
    "message": [
        {
            "value": "test@test.com",
            "property": "email",
            "children": [],
            "constraints": {
                "UserEmailUnique": "User with this email already exists"
            }
        }
    ],
    "error": "Unprocessable Entity"
}
```

Even if you will send `email` field like `test@test.com` it still will return an error that user exists.

What's next?

We have an endpoint to signup users. But we can't authenticate yet. Actually, `signup` endpoint should return a token to authenticate. 

But it will be in one of next chapters of my tutorial. 
