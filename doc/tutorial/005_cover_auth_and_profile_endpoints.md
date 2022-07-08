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


