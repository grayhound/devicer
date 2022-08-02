import * as request from 'supertest';
import { SignupTests } from './signup/signup.tests';
import { AuthTests } from './auth/auth.tests';
import { ProfileTests } from './profile/profile.tests';
import { ProfileChangePasswordTests } from './profile/changePassword/changePassword.tests';
import { DeviceTests } from './device/device.tests';

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

describe('ProfileTests', () => {
  describe('ProfileGetTest', ProfileTests.get);
  describe('ProfilePostTest', ProfileTests.post);
  describe('ProfileDeleteTest', ProfileTests.delete);
  describe('ProfilePatchTest', ProfileTests.patch);
  describe('ProfilePutTest', ProfileTests.put);
});

describe('ProfileChangePasswordTests', () => {
  describe('ProfileChangePasswordGetTest', ProfileChangePasswordTests.get);
  describe('ProfileChangePasswordPostTest', ProfileChangePasswordTests.post);
  describe(
    'ProfileChangePasswordDeleteTest',
    ProfileChangePasswordTests.delete,
  );
  describe('ProfileChangePasswordPatchTest', ProfileChangePasswordTests.patch);
  describe('ProfileChangePasswordPutTest', ProfileChangePasswordTests.put);
});

describe('DeviceTests', () => {
  describe('DevicePostTests', DeviceTests.post);
  describe('DevicePutTests', DeviceTests.put);
});
