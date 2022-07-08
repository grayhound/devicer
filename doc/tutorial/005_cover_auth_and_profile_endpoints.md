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

Now, we should create `src/tests/singup/signup.test.ts`:

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

  
