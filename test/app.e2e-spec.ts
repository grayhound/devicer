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
