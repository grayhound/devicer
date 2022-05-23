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
