# Cover REST API endpoints with end-to-end tests

## About testing.

Any project grows. At any time you would like to change some code. 

Even a small change can break everything. 

That's why you should make tests even as backend programmer.

Don't worry, that's not that hard. In our case we will test endpoints themselves.

This is called end-to-end testing. We will use `Jest` and `supertest` for this.

Remember those rules we had for our validator? We are going to use them.

We will just check that:

- Our endpoint works without any incoming data. POST to `signup` must return an error.
- We will check that `email` field. If it's empty - endpoint must return error. 
- We will check that `email` field is checked correctly for an email. We will just try to put number, true/false, some string that is not email.
- We will check that validator check that `password` is empty.
- We will check that validator check that `passwordCheck` is empty.
- We will check that validator correctly checks `password` and `passwordCheck` are equal.
- We will check that `email` is unique

If you have any other ideas on how to check those values, please tell me!

As a programmer, you should check so called 'happy paths'. 

This means that you at least should check that correctly input data works.

By doing this you can be sure that your endpoint still works even after global changes.

With time your own tests will grow and grow. Believe me, you will like righting tests.

And testers will help you with some additional tests. 

## Let's start testing!

You can find configuration and generated test inside `test` directory.

And you can even run them already! Just use command:

`npm run test:e2e`

This test is truly simple and will check root endpoint.

Test will be passed, 'cause we made no changes to the `src/app.controller.ts`.

## Preparation.

We need to install some dependecies:

`npm i supertest jest-extended --save-dev`

Edit `package.json`. Find:

`"test:e2e": "jest"`

and change it with:
 
`"test:e2e": "cross-env NODE_ENV=test jest --config ./test/jest-e2e.json --runInBand"`

With this command updated tests will run one after another, under `test` environment with specific config.

We need new files for configuration:

Create `/src/config/envs/test/app.config.ts`:

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
});

```

Now create `/src/config/envs/test/postgresql.config.ts`:

```typescript
const config = {
  type: 'postgres',

  host: process.env.DEVICER_POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.DEVICER_POSTGRES_PORT, 10) || 5432,

  username: process.env.DEVICER_POSTGRES_USER || 'postgres',
  password: process.env.DEVICER_POSTGRES_PASSWORD || '',
  database: process.env.DEVICER_POSTGRES_DB || '',

  synchronize: false,
  dropSchema: true,
  logging: false,
  migrationsRun: true,

  entities: ['src/modules/**/*.entity.ts'],

  migrationsTableName: 'migrations',

  migrations: ['src/migrations/*.ts'],
};

export default config;
```

Config are slightly different from those you can find inside `dev` environment.

Here, we add `dropSchema` for postgres - test database should be dropped on each test run.

There's also `migrationsRun` - we need to fill schema in order to start testing.

> Never use those under production!

Hold on, a little bit more.

Now edit  `src/config/loadAppConfig.ts`

```typescript
export function loadAppConfig(env = 'main') {
  let config;
  switch (env) {
    case 'dev':
      config = require('./envs/dev/app.config');
      break;
    case 'test':
      config = require('./envs/test/app.config');
      break;
    default:
      config = require('./envs/dev/app.config');
  }

  return config.default;
}
```

Now this function is ready to load `test` environment config. Only `.env.test` file is left. Create it!

```
DEVICER_API_PORT=5012

DEVICER_POSTGRES_HOST=localhost
DEVICER_POSTGRES_USER=devicer_test
DEVICER_POSTGRES_DB=devicer_test
DEVICER_POSTGRES_PASSWORD=devicer_test
DEVICER_POSTGRES_PORT=5433
DEVICER_POSTGRES_PGDATA=/data/postgres
```

Both API and Postgres will be running at different ports.

Check up `docker/envs/devicer-test` for a new environment. It's similar to `devicer-dev`, just different credentials and ports.

Configuration for environment is ready, now it's time to configur `jest`.

Create `test/jest-e2e.json`:

```json
{
  "moduleFileExtensions": ["js", "json", "ts"],
  "rootDir": ".",
  "testEnvironment": "node",
  "testRegex": ".e2e-spec.ts$",
  "setupFilesAfterEnv": ["<rootDir>/jest-e2e.setup.ts"],
  "verbose": true,
  "transform": {
    "^.+\\.(t|j)s$": "ts-jest"
  }
}
```

There's `setupFilesAfterEnv` parameter. This will help us to setup and run our test server.

Let's create it:

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import {
  INestApplication,
  UnprocessableEntityException,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import * as dotenv from 'dotenv';
import { ConfigService } from '@nestjs/config';
import { useContainer } from 'class-validator';
import { TrimStringsPipe } from '../src/base/transformer/trim-strings.pipe';
import 'jest-extended';
import * as matchers from 'jest-extended/all';
expect.extend(matchers);

dotenv.config();

/**
 * Setup test application
 */
async function setupTestApplication() {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app: INestApplication = moduleFixture.createNestApplication();

  const configService = app.get(ConfigService);

  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  app.useGlobalPipes(
    new TrimStringsPipe(),
    new ValidationPipe({
      transform: true,
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
  await app.init();

  global.app = app;
  global.appModule = moduleFixture;
}

/**
 * Setup globals to use in tests.
 */
beforeAll(async () => {
  await setupTestApplication(); // application itself
  global.prefix = '/v1'; // REST api endpoints urls prefix
});

/**
 * Close application after all tests.
 */
afterAll(async () => {
  await global.app.close();
});
```

This one is similar to `bootstrap` in the `src/main.ts`. 

See that `beforeAll` function? Test will run it once, save `global.app` and `global.appModule` to access them in our tests.

There's also `global.prefix` for easier use. We can add any other global later.

Edit `app.e2e-spec.ts`:

```typescript
import * as request from 'supertest';

describe('Tests', () => {
  it('/ (GET)', () => {
    return request(global.app.getHttpServer())
      .get(`${global.prefix}`)
      .expect(200)
      .expect('Hello World!');
  });
});
```

Now, our test is way smaller. We just use `global.app` to send requests and test results.

Time to test `/signup` endpoint.

> Just keep in mind there 5 main HTTP methods:
> 
> GET - get some information, single object or array of objects.
> 
> POST - create new object
>
> DELETE - delete some object
>
> PUT - update some object with absolutely new data
>
> PATCH - update just one specific field
>
> Each endpoint could have any of those methods. I recommend to split test in `%endpoint/%method.e2e-spec.ts`
>
> In case of POST method it will be file `signup/post.e2e-spec.ts`
>
> I highly recommend to test all methods even if they are not available. You should be sure that someone didn't add the method you don't need just by mistake.
>
> It won't be fun to have DELETE method for `/signup` endpoint.

Before we start with our POST method, let's create checkups for all other methods.

Create `test/signup/delete.e2e-spec.ts`:

```typescript
import * as request from 'supertest';

describe('[DELETE] /signup endpoint', () => {
  it('must return 404 on DELETE request', async () => {
    const res = await request(global.app.getHttpServer())
      .delete(`${global.prefix}/signup`)
      .send();
    expect(res.status).toBe(404);
    expect(res.body.statusCode).toBe(404);
  });
});
```

Create `test/signup/get.e2e-spec.ts`:

```typescript
import * as request from 'supertest';

describe('[GET] /signup endpoint', () => {
  it('must return 404 on GET request', async () => {
    const res = await request(global.app.getHttpServer())
      .get(`${global.prefix}/signup`)
      .send();
    expect(res.status).toBe(404);
    expect(res.body.statusCode).toBe(404);
  });
});

```

Create `test/signup/patch.e2e-spec.ts`:

```typescript
import * as request from 'supertest';

describe('[PATCH] /signup endpoint', () => {
  it('must return 404 on PATCH request', async () => {
    const res = await request(global.app.getHttpServer())
      .patch(`${global.prefix}/signup`)
      .send();
    expect(res.status).toBe(404);
    expect(res.body.statusCode).toBe(404);
  });
});
```

Create `test/signup/put.e2e-spec.ts`:

```typescript
import * as request from 'supertest';

describe('[PUT] /signup endpoint', () => {
  it('must return 404 on PUT request', async () => {
    const res = await request(global.app.getHttpServer())
      .put(`${global.prefix}/signup`)
      .send();
    expect(res.status).toBe(404);
    expect(res.body.statusCode).toBe(404);
  });
});
```

This is simple - each test tries according methods and checks that this method doesn't work.

> Actually, this maybe a good idea to return 405 HTTP error - Method not allowed, but let's just forget about it.

Now, for most interesting part - `test/signup/post.e2e-spec.ts`:

```typescript
import * as request from 'supertest';

// check up variables
const checkUps = {
  email: {
    // correct and incorrect email
    incorrect: 'test',
    correct: 'test@test.com',

    // correct and duplicate email with uppercase
    uppercaseDuplicate: 'Test@test.com',
    uppercaseCorrect: 'Test2@test.com',

    // whitespace correct and duplicate
    whitespaceDuplicate: '  Test@test.com  ',
    whitespaceCorrect: '    Test3@test.com   ',

    // test inner whitespace - incorrect email
    innerWhitespaceIncorrect: 'test @gm ail.com',

    // test boolean - incorrect email
    booleanIncorrect: true,

    // test number - incorrect email
    numberIncorrect: 1000,
  },
  password: {
    correct: 'test',
  },
  passwordCheck: {
    correct: 'test',
    incorrect: 'Test',
  },
};

describe('[POST] /signup endpoint', () => {

});
```

Just keep in mind that `checkups` variable. Here are few types of inputs that we want to test.

Now, we are going to add tests inside that `describe` block.

Let's start. Here we send empty data and expect to get errors on each field.

```typescript
  it('should return errors without any data sent', async () => {
    const data = {};
    const res = await request(global.app.getHttpServer())
      .post(`${global.prefix}/signup`)
      .send(data);
    expect(res.status).toBe(422);
    expect(res.body.statusCode).toBe(422);
    expect(res.body).toHaveProperty('message');
    expect(res.body.message).toBeArray();
    expect(res.body.message).not.toBeEmpty();

    // error for property 'email' with constraints 'isNotEmpty'
    expect(res.body.message).toIncludeAllPartialMembers([
      {
        property: 'email',
        constraints: expect.toContainKey('isNotEmpty'),
      },
    ]);

    // error for property 'password' with constraints 'isNotEmpty'
    expect(res.body.message).toIncludeAllPartialMembers([
      {
        property: 'password',
        constraints: expect.toContainKey('isNotEmpty'),
      },
    ]);

    // error for property 'passwordCheck' with constraints 'isNotEmpty'
    expect(res.body.message).toIncludeAllPartialMembers([
      {
        property: 'passwordCheck',
        constraints: expect.toContainKey('isNotEmpty'),
      },
    ]);
  });
```

As you can see it's really easy to read those tests. The problem could be `toIncludeAllPartialMembers`.

This one comes from [jest-extended](https://github.com/jest-community/jest-extended) library. 
It add some additional methods to make checkups a little bit easier.

Alright, now, let's try to send data with email in wrong format.

Here you can see, that validator shouldn't return `isNotEmpty` but `isEmail` instead.

```typescript
  it('should return errors if email in wrong format', async () => {
    const data = { email: checkUps.email.incorrect };
    const res = await request(global.app.getHttpServer())
      .post(`${global.prefix}/signup`)
      .send(data);
    expect(res.status).toBe(422);
    expect(res.body.statusCode).toBe(422);
    expect(res.body).toHaveProperty('message');
    expect(res.body.message).toBeInstanceOf(Array);

    // should not get error for property 'email' with contrainsts 'isNotEmpty'
    expect(res.body.message).not.toIncludeAllPartialMembers([
      {
        property: 'email',
        constraints: expect.toContainKey('isNotEmpty'),
      },
    ]);

    // error for property 'email' with constraints 'isEmail'
    expect(res.body.message).toIncludeAllPartialMembers([
      {
        property: 'email',
        constraints: expect.toContainKey('isEmail'),
      },
    ]);

    // error for property 'password' with constraints 'isNotEmpty'
    expect(res.body.message).toIncludeAllPartialMembers([
      {
        property: 'password',
        constraints: expect.toContainKey('isNotEmpty'),
      },
    ]);

    // error for property 'passwordCheck' with constraints 'isNotEmpty'
    expect(res.body.message).toIncludeAllPartialMembers([
      {
        property: 'passwordCheck',
        constraints: expect.toContainKey('isNotEmpty'),
      },
    ]);
  });
```

Now we are sending correct email but without passwords:

```typescript
  it('should not return email error if email is in correct format', async () => {
    const data = { email: checkUps.email.correct };
    const res = await request(global.app.getHttpServer())
      .post(`${global.prefix}/signup`)
      .send(data);
    expect(res.status).toBe(422);
    expect(res.body.statusCode).toBe(422);
    expect(res.body).toHaveProperty('message');
    expect(res.body.message).toBeInstanceOf(Array);

    // should not return error with property email
    expect(res.body.message).not.toIncludeAllPartialMembers([
      {
        property: 'email',
      },
    ]);

    // error for property 'password' with constraints 'isNotEmpty'
    expect(res.body.message).toIncludeAllPartialMembers([
      {
        property: 'password',
        constraints: expect.toContainKey('isNotEmpty'),
      },
    ]);

    // error for property 'passwordCheck' with constraints 'isNotEmpty'
    expect(res.body.message).toIncludeAllPartialMembers([
      {
        property: 'passwordCheck',
        constraints: expect.toContainKey('isNotEmpty'),
      },
    ]);
  });
```
Send a password now! But without `passwordCheck`

```typescript
  it('should not return error if `password` is present', async () => {
    const data = {
      email: checkUps.email.correct,
      password: checkUps.password.correct,
    };
    const res = await request(global.app.getHttpServer())
      .post(`${global.prefix}/signup`)
      .send(data);
    expect(res.status).toBe(422);
    expect(res.body.statusCode).toBe(422);
    expect(res.body).toHaveProperty('message');
    expect(res.body.message).toBeInstanceOf(Array);

    // should not return error with property email
    expect(res.body.message).not.toIncludeAllPartialMembers([
      {
        property: 'email',
      },
    ]);

    // should not return error for property 'password' with constraints 'isNotEmpty'
    expect(res.body.message).not.toIncludeAllPartialMembers([
      {
        property: 'password',
        constraints: expect.toContainKey('isNotEmpty'),
      },
    ]);

    // error for property 'passwordCheck' with constraints 'isNotEmpty'
    expect(res.body.message).toIncludeAllPartialMembers([
      {
        property: 'passwordCheck',
        constraints: expect.toContainKey('isNotEmpty'),
      },
    ]);
  });
```

Now we are sending all data, but `passwordCheck` is not equal too `password`. 

This test also checks that `password` and `passwordCheck` are absolutely equal:

```typescript
  it('should not return error if `passwordCheck` is present (but still not equal to to password)', async () => {
    const data = {
      email: checkUps.email.correct,
      password: checkUps.password.correct,
      passwordCheck: checkUps.passwordCheck.incorrect,
    };
    const res = await request(global.app.getHttpServer())
      .post(`${global.prefix}/signup`)
      .send(data);
    expect(res.status).toBe(422);
    expect(res.body.statusCode).toBe(422);
    expect(res.body).toHaveProperty('message');
    expect(res.body.message).toBeInstanceOf(Array);

    // should not return error with property email
    expect(res.body.message).not.toIncludeAllPartialMembers([
      {
        property: 'email',
      },
    ]);

    // should not return error for property 'password' with constraints 'isNotEmpty'
    expect(res.body.message).not.toIncludeAllPartialMembers([
      {
        property: 'password',
        constraints: expect.toContainKey('isNotEmpty'),
      },
    ]);

    // error for property 'passwordCheck' with constraints 'isNotEmpty'
    expect(res.body.message).not.toIncludeAllPartialMembers([
      {
        property: 'passwordCheck',
        constraints: expect.toContainKey('isNotEmpty'),
      },
    ]);

    // error for property `passwordCheck` if passwords differ
    expect(res.body.message).toIncludeAllPartialMembers([
      {
        property: 'passwordCheck',
        constraints: expect.toContainKey('PasswordsMatch'),
      },
    ]);
  });
```

I guess we checked most of the things we need to know the data is validated correctly.

Now, lets signup user by sending correct data.

If everything is fine you should get a response with user data (right now it's just an object with email).

```typescript
  it('should signup user if everything is correct', async () => {
    const data = {
      email: checkUps.email.correct,
      password: checkUps.password.correct,
      passwordCheck: checkUps.passwordCheck.correct,
    };
    const res = await request(global.app.getHttpServer())
      .post(`${global.prefix}/signup`)
      .send(data);
    expect(res.status).toBe(201);
    expect(res.body).toBeObject();
    expect(res.body).toHaveProperty('email');
    expect(res.body.email).toBe(checkUps.email.correct);
  });
``` 

Wait, but are we sure that user is really in the database? Let's check it.

Remember that `global.appModule`? It will help us to access `UserRepository` and make requests to the `user` table. 

```typescript
  it('user must exist in the database', async () => {
    const user = await global.appModule
      .get('UserRepository')
      .findOneBy({ email: checkUps.email.correct });
    expect(user).not.toBeNull();
    expect(user).toHaveProperty('email');
    expect(user).toHaveProperty('emailOriginal');
    expect(user).toHaveProperty('password');
    expect(user.email).toBe(checkUps.email.correct);
    expect(user.emailOriginal).toBe(checkUps.email.correct);
  });
```

We have a user in the database, time to check up that user won't be able to signup with same email again.

First test was with `test@test.com`. This time we are testing with `Test@test.com`. Since email is normalized these emails are considered the same.

```typescript
  it('should return error if user exists', async () => {
    const data = {
      email: checkUps.email.uppercaseDuplicate,
      password: checkUps.password.correct,
      passwordCheck: checkUps.passwordCheck.correct,
    };
    const res = await request(global.app.getHttpServer())
      .post(`${global.prefix}/signup`)
      .send(data);
    expect(res.status).toBe(422);
    expect(res.body.statusCode).toBe(422);
    expect(res.body).toHaveProperty('message');
    expect(res.body.message).toBeInstanceOf(Array);

    // should not return error with property email
    expect(res.body.message).toIncludeAllPartialMembers([
      {
        property: 'email',
        constraints: expect.toContainKey('UserEmailUnique'),
      },
    ]);

    // should not return error for property 'password'
    expect(res.body.message).not.toIncludeAllPartialMembers([
      {
        property: 'password',
      },
    ]);

    // should not return error for property 'passwordCheck'
    expect(res.body.message).not.toIncludeAllPartialMembers([
      {
        property: 'passwordCheck',
      },
    ]);
  });
```

How about we signup some other user? For example, `Test2@test.com`.

Take a look at last `expect` - we check with normalized email, so we cast `toLowerCase` on that checked up data.

```typescript
  it('should sign up another user', async () => {
    const data = {
      email: checkUps.email.uppercaseCorrect,
      password: checkUps.password.correct,
      passwordCheck: checkUps.passwordCheck.correct,
    };
    const res = await request(global.app.getHttpServer())
      .post(`${global.prefix}/signup`)
      .send(data);

    expect(res.status).toBe(201);
    expect(res.body).toBeObject();
    expect(res.body).toHaveProperty('email');
    expect(res.body.email).toBe(checkUps.email.uppercaseCorrect.toLowerCase());
  });
```

This user must exist in the database:

```typescript
  it('new user must exist in the database', async () => {
    const checkedEmail = checkUps.email.uppercaseCorrect.toLowerCase();
    const user = await global.appModule
      .get('UserRepository')
      .findOneBy({ email: checkedEmail });
    expect(user).not.toBeNull();
    expect(user).toHaveProperty('email');
    expect(user).toHaveProperty('emailOriginal');
    expect(user).toHaveProperty('password');
    expect(user.email).toBe(checkedEmail);
    expect(user.emailOriginal).toBe(checkUps.email.uppercaseCorrect);
  });
```

Now, a little bit checkup on spaces. Incoming data should be trimmed.

In this case `  Test@test.com  ` value is considered a duplicate, cause spaces are trimmed and email is normalized.

```typescript
  it('should return error if user exists (whitspace check)', async () => {
    const data = {
      email: checkUps.email.whitespaceDuplicate,
      password: checkUps.password.correct,
      passwordCheck: checkUps.passwordCheck.correct,
    };
    const res = await request(global.app.getHttpServer())
      .post(`${global.prefix}/signup`)
      .send(data);
    expect(res.status).toBe(422);
    expect(res.body.statusCode).toBe(422);
    expect(res.body).toHaveProperty('message');
    expect(res.body.message).toBeInstanceOf(Array);

    // should not return error with property email
    expect(res.body.message).toIncludeAllPartialMembers([
      {
        property: 'email',
        constraints: expect.toContainKey('UserEmailUnique'),
      },
    ]);

    // should not return error for property 'password'
    expect(res.body.message).not.toIncludeAllPartialMembers([
      {
        property: 'password',
      },
    ]);

    // should not return error for property 'passwordCheck'
    expect(res.body.message).not.toIncludeAllPartialMembers([
      {
        property: 'passwordCheck',
      },
    ]);
  });
```

But application must signup non existing user even if email has spaces inputed by user:

```typescript
  it('should sign up another user', async () => {
    const data = {
      email: checkUps.email.whitespaceCorrect,
      password: checkUps.password.correct,
      passwordCheck: checkUps.passwordCheck.correct,
    };
    const res = await request(global.app.getHttpServer())
      .post(`${global.prefix}/signup`)
      .send(data);

    expect(res.status).toBe(201);
    expect(res.body).toBeObject();
    expect(res.body).toHaveProperty('email');
    expect(res.body.email).toBe(checkUps.email.whitespaceCorrect.toLowerCase().trim());
  });
```

And, once again, check that user exists:

```typescript
  it('new user must exist in the database', async () => {
    const checkedEmail = checkUps.email.whitespaceCorrect.toLowerCase().trim();
    const user = await global.appModule
      .get('UserRepository')
      .findOneBy({ email: checkedEmail });
    expect(user).not.toBeNull();
    expect(user).toHaveProperty('email');
    expect(user).toHaveProperty('emailOriginal');
    expect(user).toHaveProperty('password');
    expect(user.email).toBe(checkedEmail);
    expect(user.emailOriginal).toBe(checkUps.email.whitespaceCorrect.trim());
  });
```

Spaces inside email are not allowed. This is incorrect email format:

```typescript
  it('should return errors if email in wrong format (inner whitespace)', async () => {
    const data = { email: checkUps.email.innerWhitespaceIncorrect };
    const res = await request(global.app.getHttpServer())
      .post(`${global.prefix}/signup`)
      .send(data);
    expect(res.status).toBe(422);
    expect(res.body.statusCode).toBe(422);
    expect(res.body).toHaveProperty('message');
    expect(res.body.message).toBeInstanceOf(Array);

    // error for property 'email' with constraints 'isEmail'
    expect(res.body.message).toIncludeAllPartialMembers([
      {
        property: 'email',
        constraints: expect.toContainKey('isEmail'),
      },
    ]);
  });
``` 

Couple silly checkups. What if we will send `email` field as boolean?

Yep, we will get error that it's not an email.

```typescript
  it('should return errors if email in wrong format (boolean)', async () => {
    const data = { email: checkUps.email.booleanIncorrect };
    const res = await request(global.app.getHttpServer())
      .post(`${global.prefix}/signup`)
      .send(data);
    expect(res.status).toBe(422);
    expect(res.body.statusCode).toBe(422);
    expect(res.body).toHaveProperty('message');
    expect(res.body.message).toBeInstanceOf(Array);

    // error for property 'email' with constraints 'isEmail'
    expect(res.body.message).toIncludeAllPartialMembers([
      {
        property: 'email',
        constraints: expect.toContainKey('isEmail'),
      },
    ]);
  });
```

Some number won't be considered an email too. Validator will stop user from signup:

```typescript
  it('should return errors if email in wrong format (number)', async () => {
    const data = { email: checkUps.email.numberIncorrect };
    const res = await request(global.app.getHttpServer())
      .post(`${global.prefix}/signup`)
      .send(data);
    expect(res.status).toBe(422);
    expect(res.body.statusCode).toBe(422);
    expect(res.body).toHaveProperty('message');
    expect(res.body.message).toBeInstanceOf(Array);

    // error for property 'email' with constraints 'isEmail'
    expect(res.body.message).toIncludeAllPartialMembers([
      {
        property: 'email',
        constraints: expect.toContainKey('isEmail'),
      },
    ]);
  });
```

Right now, if you never worked with tests, you can say: "This test got way more code". 

Yes it is. But now you can be way more sure that any changes to your API won't break up `SignupModule`.

Now, off to authentication!
