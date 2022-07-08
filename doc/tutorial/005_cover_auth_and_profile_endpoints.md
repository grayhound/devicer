# Cover `auth` and `profile` endpoints and learn test sequencer

We know how to make jest not to run tests in parallel.

But we have additional endpoints now that work on the same database.

What's the point of testing `login` or `profile` endpoints if there are no users in the database?

We want to run `signup` tests first, then we want `login` tests and only then `profile` tests.

`Jest` doesn't give it to us just out of the box.

Fortunately, there are couple of ways to solve the problem.

One of them is using `@jest/test-sequencer`. 

> But we are not going to use. I wish I could. I don't want to. 
>
> First of all, test-sequencer config is not transpiled from `TypeScript` for some reason. 
>
> We can run tests, even setup tests like we did in `jest-e2e.setup.ts` but sequencer should be common-js file.
>
> And that sucks.
>
> Second - sequencer doesn't give us that much options to make and order.
>
> Sequencer just takes all tests as an array an we should sort them somehow.
>
> I had an idea to call tests like `0001_test.test.js`, `0002_test.test.js'. But in case we need to change order for 100+ files - that will be really tedious work.
>
> That's why we are going to use the second method. The one I used making tests with `chai` and `mocha`.

Another one - is to export every test as a function and then run them in order we need. 

Lets make some preparations!

## Refactoring tests

Rename all  `test/signup/*` files.

They were called `delete.e2e-spec.ts`, `get.e2e-spec.ts`, etc.

Rebane them to look like:
- `delete.test.ts`
- `get.test.ts`
- `patch.test.ts`
- `post.test.ts`
- `put.test.ts`

Now, we need to export those tests as functions.

All you just have to do is wrap tests with methods.

For example, `delete.test.ts` will look like this:

```typescript
import * as request from 'supertest';

export const SignupDeleteTest = () => {
  describe('[DELETE] /signup endpoint', () => {
    it('must return 404 on get request', async () => {
      const res = await request(global.app.getHttpServer())
        .delete(`${global.prefix}/signup`)
        .send();
      expect(res.status).toBe(404);
      expect(res.body.statusCode).toBe(404);
    });
  });
};
```

The same goes for other test files:

`get.test.ts`:

```typescript
import * as request from 'supertest';

export const SignupGetTest = () => {
  describe('[GET] /signup endpoint', () => {
    it('must return 404 on get request', async () => {
      const res = await request(global.app.getHttpServer())
        .get(`${global.prefix}/signup`)
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

export const SignupPatchTest = () => {
  describe('[PATCH] /signup endpoint', () => {
    it('must return 404 on get request', async () => {
      const res = await request(global.app.getHttpServer())
        .patch(`${global.prefix}/signup`)
        .send();
      expect(res.status).toBe(404);
      expect(res.body.statusCode).toBe(404);
    });
  });
};
```

`post.test.ts`:

```typescript
import * as request from 'supertest';

export const SignupPostTest = () => {
  ...
};

```

`put.test.ts`:

```typescript
import * as request from 'supertest';

export const SignupPutTest = () => {
  describe('[PUT] /signup endpoint', () => {
    it('must return 404 on get request', async () => {
      const res = await request(global.app.getHttpServer())
        .put(`${global.prefix}/signup`)
        .send();
      expect(res.status).toBe(404);
      expect(res.body.statusCode).toBe(404);
    });
  });
}
```

Right now those tests won't run 'cause we changed their names.

Now, we should create `tests/singup/signup.test.ts`:

```typescript
import { SignupDeleteTest } from './delete.test';
import { SignupGetTest } from './get.test';
import { SignupPatchTest } from './patch.test';
import { SignupPutTest } from './put.test';
import { SignupPostTest } from './post.test';

export const SignupTests = {
  delete: SignupDeleteTest,
  get: SignupGetTest,
  patch: SignupPatchTest,
  put: SignupPutTest,
  post: SignupPostTest,
};
```

And the last one - edit `app.e2e.spec.ts`:

```typescript
import * as request from 'supertest';
import { SignupTests } from './signup/signup.tests';

describe('Tests', () => {
  it('/ (GET)', () => {
    return request(global.app.getHttpServer())
      .get(`${global.prefix}`)
      .expect(200)
      .expect('Hello World!');
  });
});

describe('SignupTests', () => {
  describe('SignupGetTest', SignupTests.get);
  describe('SignupPostTest', SignupTests.post);
  describe('SignupDeleteTest', SignupTests.delete);
  describe('SignupPatchTest', SignupTests.patch);
  describe('SignupPutTest', SignupTests.put);
});
```

Easy as pie! We just import those tests from `SignupTests`, create new `describe` block and inside it - another describes that use our imported tests.

And you can easily change tests order or create different test blocks for different endpoints.

Go ahead! Run the tests!

`npm run test:e2e`

√ 21 tests passed!
 
## Auth tests

We need the same structure for `auth` endpoint tests, like we had for `signup`.

Inside `test/auth` create files:

`delete.test.ts`:

```typescript
import * as request from 'supertest';

export const AuthDeleteTest = () => {
  describe('[DELETE] /auth endpoint', () => {
    it('must return 404 on get request', async () => {
      const res = await request(global.app.getHttpServer())
        .delete(`${global.prefix}/auth`)
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

export const AuthGetTest = () => {
  describe('[GET] /auth endpoint', () => {
    it('must return 404 on get request', async () => {
      const res = await request(global.app.getHttpServer())
        .get(`${global.prefix}/auth`)
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

export const AuthPatchTest = () => {
  describe('[PATCH] /auth endpoint', () => {
    it('must return 404 on get request', async () => {
      const res = await request(global.app.getHttpServer())
        .patch(`${global.prefix}/auth`)
        .send();
      expect(res.status).toBe(404);
      expect(res.body.statusCode).toBe(404);
    });
  });
}
```

`post.test.ts`, that will be just an empty function for now, we will fill it with tests later:

```typescript
import * as request from 'supertest';

export const AuthPostTest = () => {
};
```

And now to import those files - `auth.test.ts`:

```typescript
import { AuthDeleteTest } from './delete.test';
import { AuthGetTest } from './get.test';
import { AuthPatchTest } from './patch.test';
import { AuthPutTest } from './put.test';
import { AuthPostTest } from './post.test';

export const AuthTests = {
  delete: AuthDeleteTest,
  get: AuthGetTest,
  patch: AuthPatchTest,
  put: AuthPutTest,
  post: AuthPostTest,
};
```

> Please don't tell me you didn't copypaste files from `signup` directory to `auth` and made changes!
> 
> They idea is very simple - you have almost same structure, you have to change `signup` to `auth` in files.
>
> Just do it! Copypasting is not bad and saves you ton of time. You have similar code structure - just copy! Don't code it again and again.
>
> On the next step - copypaste too! Just change `Signup` to `Auth` for new tests:

Now to add those tests to `app.e2e-spec.ts`:

```typescript
import * as request from 'supertest';
import { SignupTests } from './signup/signup.tests';
import { AuthTests } from './auth/auth.tests';

describe('Tests', () => {
  it('/ (GET)', () => {
    return request(global.app.getHttpServer())
      .get(`${global.prefix}`)
      .expect(200)
      .expect('Hello World!');
  });
});

describe('SignupTests', () => {
  describe('SignupGetTest', SignupTests.get);
  describe('SignupPostTest', SignupTests.post);
  describe('SignupDeleteTest', SignupTests.delete);
  describe('SignupPatchTest', SignupTests.patch);
  describe('SignupPutTest', SignupTests.put);
});

describe('AuthTests', () => {
  describe('AuthGetTest', AuthTests.get);
  describe('AuthPostTest', AuthTests.post);
  describe('AuthDeleteTest', AuthTests.delete);
  describe('AuthPatchTest', AuthTests.patch);
  describe('AuthPutTest', AuthTests.put);
});
```

Run the tests!

`npm run test:e2e`

Right now it's just a fool-check, it's doesn't even check POST for `auth` endpoint.

Lets fill it!

What we need to check up `auth` endpoint?

We have some users signed-up already, keep that in mind. This tests run in one single state.

Tests we need:

- Check that email is inputed.
- Check that password is inputed.
- Check that email is correct email (yes, we need to check that too and tell user he inputed wrong data)
- Send correct email and password and get token.
- Send correct email and incorrect password and get 401 error.
- Send correct email and password ang get token. But email is Uppercase.
- Send correct email but with spaces and correct password and get token.

We can also send some gibberish data, but let's omit that for now. We have quite a handful of tests already.

## Auth tests.

Remember those `checkUps` at `SignupPostTest`? We need to use them again. 

Create `test/_data/signup.checkups.ts` file like this:

```typescript
export const SignupCheckups = {
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
```

Inside `test/signup/post.test.ts` you should make this changes:

```typescript
import * as request from 'supertest';
import { SignupCheckups } from '../_data/signup.checkups';

export const SignupPostTest = () => {
  const checkUps = SignupCheckups;
  ...
```

And run the tests again! You must be sure test are running!

`npm run test:e2e`

> Are we there yet?

Now, we can use those checkups for `auth` endpoint tests too!

Just edit `test/auth/post.test.ts`:

```typescript
import * as request from 'supertest';
import { SignupCheckups } from '../_data/signup.checkups';

export const AuthPostTest = () => {
  const checkUps = SignupCheckups;
  describe('[POST] /auth endpoint', () => {

  });
};

```

And now for the test themselves! 

Don't forget to write those tests inside `describe` block.

First test - no data. We should get errors with 422 status code.

With this test we will check first two items - `email` and `password` fields are empty.

```typescript
    it('should return errors without any data sent', async () => {
      const data = {};
      const res = await request(global.app.getHttpServer())
        .post(`${global.prefix}/auth`)
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
    });
```

Now we checkups if email is incorrect format:

```typescript
    it('should return errors if email in wrong format', async () => {
      const data = { email: checkUps.email.incorrect };
      const res = await request(global.app.getHttpServer())
        .post(`${global.prefix}/auth`)
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
    });
```

Now we checkup if email is correct but there's no password:

```typescript
    it('should not return email error if email is in correct format', async () => {
      const data = { email: checkUps.email.correct };
      const res = await request(global.app.getHttpServer())
        .post(`${global.prefix}/auth`)
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
    });
```

Now, let's try to authenticate user:

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
    });
```

How about test a user with wrong password? We should get 401 error.

For this one, we need to extend `signup.checkups.ts`:

```typescript
  ...
  password: {
    correct: 'test',
    incorrect: 'Test',
  },
  ...
```

Password differs 'cause it's uppercase. And that's wrong password.

Now the test:

```typescript
    it('should not authenticate user with wrong password', async () => {
      const data = {
        email: checkUps.email.correct,
        password: checkUps.password.incorrect,
      };
      const res = await request(global.app.getHttpServer())
        .post(`${global.prefix}/auth`)
        .send(data);
      expect(res.status).toBe(401);
    });
```

Now for case where email is uppercase (damn it's kind of poetry). It should authenticate:

```typescript
    it('should authenticate user even if email is Uppercase', async () => {
      const data = {
        email: checkUps.email.uppercaseCorrect,
        password: checkUps.password.correct,
      };
      const res = await request(global.app.getHttpServer())
        .post(`${global.prefix}/auth`)
        .send(data);
      expect(res.status).toBe(201);
      expect(res.body).toBeObject();
      expect(res.body).toHaveProperty('token');
    });
```

And the last case. For some reason user pressed space button trying to enter email:

```typescript
    it('should authenticate user even if email is with whitespaces', async () => {
      const data = {
        email: checkUps.email.whitespaceCorrect,
        password: checkUps.password.correct,
      };
      const res = await request(global.app.getHttpServer())
        .post(`${global.prefix}/auth`)
        .send(data);
      expect(res.status).toBe(201);
      expect(res.body).toBeObject();
      expect(res.body).toHaveProperty('token');
    });
```

And now run the tests!

`npm run test:e2e`

√ 32 passed, 32 total!

> You may ask why the hell I'm wasting so much time for testing?
>
> Because coding without testing will have its effects sooner or later.
>
> Oh, and you will know. Even one line of code can destroy everything. 
> 
> It's better to be sure that your code works.
>
> In this case it's not even unit testing. It's end-to-end testing. These tests know nothing about your code.
>
> These tests see code like a `BLACKBOX`. Which is good. Blackbox is really good. You know nothing about your or any other developer code except what's written on the box.
>
> You just follow instructions and try to test what you see.
>
> One you open the box - it's Pandora's Box. Unfortunately you will have to open some of those boxes.
>
> But before that - follow the instruction on the box. If it says - don't open - you don't open.
>
> It says `auth` endpoint needs these parameters to be send - you send them and try to test them is various ways.

 ## Profile
 
 Are we missing something? Yep, that's `profile` endpoint. Two easy tests. 
 
 - We need to checkup if `profile` send 401 error if we are not authenticated.
 - We need to checkup that `profile` returns data if we send correct token.
 
 Let's do it!
 
 Just copy `auth` to `profile` directory. And remove all tests from `post.test.ts`. Just leave a checkup that `profile` doesn't respond to POST:
 
 ```typescript
import * as request from 'supertest';

export const ProfilePostTest = () => {
  describe('[POST] /profile endpoint', () => {
    it('must return 404 on get request', async () => {
      const res = await request(global.app.getHttpServer())
        .delete(`${global.prefix}/profile`)
        .send();
      expect(res.status).toBe(404);
      expect(res.body.statusCode).toBe(404);
    });
  });
};
```

Don't forget to rename `auth.test.ts` to `profile.test.ts`. 

And don't forget to rename methods from `Auth*Test` to `Profile*Test` and `/auth` to `/profile`.

Our files inside `profile` dir should look like this:

`delete.test.ts`:

```typescript
import * as request from 'supertest';

export const ProfileDeleteTest = () => {
  describe('[DELETE] /profile endpoint', () => {
    it('must return 404 on get request', async () => {
      const res = await request(global.app.getHttpServer())
        .delete(`${global.prefix}/profile`)
        .send();
      expect(res.status).toBe(404);
      expect(res.body.statusCode).toBe(404);
    });
  });
};
```

`get.test.ts`, it's without tests for now:

```typescript
import * as request from 'supertest';

export const ProfileGetTest = () => {
  describe('[GET] /profile endpoint', () => {
  });
};
```

`patch.test.ts`:

```typescript
import * as request from 'supertest';

export const ProfilePatchTest = () => {
  describe('[PATCH] /profile endpoint', () => {
    it('must return 404 on get request', async () => {
      const res = await request(global.app.getHttpServer())
        .patch(`${global.prefix}/profile`)
        .send();
      expect(res.status).toBe(404);
      expect(res.body.statusCode).toBe(404);
    });
  });
}
```

`post.test.ts`:

```typescript
import * as request from 'supertest';

export const ProfilePostTest = () => {
  describe('[POST] /profile endpoint', () => {
    it('must return 404 on get request', async () => {
      const res = await request(global.app.getHttpServer())
        .post(`${global.prefix}/profile`)
        .send();
      expect(res.status).toBe(404);
      expect(res.body.statusCode).toBe(404);
    });
  });
};
```

`put.test.ts`:

```typescript
import * as request from 'supertest';

export const ProfilePutTest = () => {
  describe('[PUT] /profile endpoint', () => {
    it('must return 404 on get request', async () => {
      const res = await request(global.app.getHttpServer())
        .put(`${global.prefix}/profile`)
        .send();
      expect(res.status).toBe(404);
      expect(res.body.statusCode).toBe(404);
    });
  });
}
```

And now `profile.test.ts`:

```typescript
import { ProfileDeleteTest } from './delete.test';
import { ProfileGetTest } from './get.test';
import { ProfilePatchTest } from './patch.test';
import { ProfilePutTest } from './put.test';
import { ProfilePostTest } from './post.test';

export const ProfileTests = {
  delete: ProfileDeleteTest,
  get: ProfileGetTest,
  patch: ProfilePatchTest,
  put: ProfilePutTest,
  post: ProfilePostTest,
};
```

Now we need to add those tests to the `app.e2e-spec.ts`:


```typescript
...
import { ProfileTests } from './profile/profile.tests';

...

describe('ProfileTests', () => {
  describe('ProfileGetTest', ProfileTests.get);
  describe('ProfilePostTest', ProfileTests.post);
  describe('ProfileDeleteTest', ProfileTests.delete);
  describe('ProfilePatchTest', ProfileTests.patch);
  describe('ProfilePutTest', ProfileTests.put);
});

```
