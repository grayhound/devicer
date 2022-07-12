import * as request from 'supertest';
import { SignupCheckups } from '../../_data/signup.checkups';

export const ProfileChangePasswordPostTest = () => {
  const checkUps = SignupCheckups;
  let token;

  describe('[POST] /profile/changePassword endpoint', () => {
    it('must return 401 without token', async () => {
      const res = await request(global.app.getHttpServer())
        .post(`${global.prefix}/profile/changePassword`)
        .send();
      expect(res.status).toBe(401);
    });

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
      token = res.body.token;
    });

    it('should return errors without any data sent', async () => {
      const data = {};
      const res = await request(global.app.getHttpServer())
        .post(`${global.prefix}/profile/changePassword`)
        .set('Authorization', `Bearer ${token}`)
        .send(data);
      expect(res.status).toBe(422);
      expect(res.body.statusCode).toBe(422);
      expect(res.body).toHaveProperty('message');
      expect(res.body.message).toBeArray();
      expect(res.body.message).not.toBeEmpty();

      // error for property 'oldPassword' with constraints 'isNotEmpty'
      expect(res.body.message).toIncludeAllPartialMembers([
        {
          property: 'oldPassword',
          constraints: expect.toContainKey('isNotEmpty'),
        },
      ]);

      // error for property 'newPassword' with constraints 'isNotEmpty'
      expect(res.body.message).toIncludeAllPartialMembers([
        {
          property: 'newPassword',
          constraints: expect.toContainKey('isNotEmpty'),
        },
      ]);

      // error for property 'newPasswordCheck' with constraints 'isNotEmpty'
      expect(res.body.message).toIncludeAllPartialMembers([
        {
          property: 'newPasswordCheck',
          constraints: expect.toContainKey('isNotEmpty'),
        },
      ]);
    });

    it('should return errors if `oldPassword` is incorrect', async () => {
      const data = {
        oldPassword: checkUps.password.incorrect,
      };
      const res = await request(global.app.getHttpServer())
        .post(`${global.prefix}/profile/changePassword`)
        .set('Authorization', `Bearer ${token}`)
        .send(data);
      expect(res.status).toBe(422);
      expect(res.body.statusCode).toBe(422);
      expect(res.body).toHaveProperty('message');
      expect(res.body.message).toBeArray();
      expect(res.body.message).not.toBeEmpty();

      // error for property 'oldPassword' with constraints 'UserPasswordCorrectValidatorConstraint'
      expect(res.body.message).toIncludeAllPartialMembers([
        {
          property: 'oldPassword',
          constraints: expect.toContainKey(
            'UserPasswordCorrectValidatorConstraint',
          ),
        },
      ]);

      // error for property 'newPassword' with constraints 'isNotEmpty'
      expect(res.body.message).toIncludeAllPartialMembers([
        {
          property: 'newPassword',
          constraints: expect.toContainKey('isNotEmpty'),
        },
      ]);

      // error for property 'newPasswordCheck' with constraints 'isNotEmpty'
      expect(res.body.message).toIncludeAllPartialMembers([
        {
          property: 'newPasswordCheck',
          constraints: expect.toContainKey('isNotEmpty'),
        },
      ]);
    });

    it('should return errors if `oldPassword` is "correct" but with spaces', async () => {
      const data = {
        oldPassword: checkUps.password.correctWithSpaces,
      };
      const res = await request(global.app.getHttpServer())
        .post(`${global.prefix}/profile/changePassword`)
        .set('Authorization', `Bearer ${token}`)
        .send(data);
      expect(res.status).toBe(422);
      expect(res.body.statusCode).toBe(422);
      expect(res.body).toHaveProperty('message');
      expect(res.body.message).toBeArray();
      expect(res.body.message).not.toBeEmpty();

      // error for property 'oldPassword' with constraints 'UserPasswordCorrectValidatorConstraint'
      expect(res.body.message).toIncludeAllPartialMembers([
        {
          property: 'oldPassword',
          constraints: expect.toContainKey(
            'UserPasswordCorrectValidatorConstraint',
          ),
        },
      ]);
    });

    it('should return errors if `oldPassword` is correct but no `newPassword` and `newPasswordCheck`', async () => {
      const data = {
        oldPassword: checkUps.password.correct,
      };
      const res = await request(global.app.getHttpServer())
        .post(`${global.prefix}/profile/changePassword`)
        .set('Authorization', `Bearer ${token}`)
        .send(data);
      expect(res.status).toBe(422);
      expect(res.body.statusCode).toBe(422);
      expect(res.body).toHaveProperty('message');
      expect(res.body.message).toBeArray();
      expect(res.body.message).not.toBeEmpty();

      // there should be no errors for `oldPassword`
      expect(res.body.message).not.toIncludeAllPartialMembers([
        {
          property: 'oldPassword',
        },
      ]);

      // error for property 'newPassword' with constraints 'isNotEmpty'
      expect(res.body.message).toIncludeAllPartialMembers([
        {
          property: 'newPassword',
          constraints: expect.toContainKey('isNotEmpty'),
        },
      ]);

      // error for property 'newPasswordCheck' with constraints 'isNotEmpty'
      expect(res.body.message).toIncludeAllPartialMembers([
        {
          property: 'newPasswordCheck',
          constraints: expect.toContainKey('isNotEmpty'),
        },
      ]);
    });

    it('should return errors if `oldPassword`, `newPassword` is present but not `newPasswordCheck`', async () => {
      const data = {
        oldPassword: checkUps.password.correct,
        newPassword: checkUps.newPassword.correct,
      };
      const res = await request(global.app.getHttpServer())
        .post(`${global.prefix}/profile/changePassword`)
        .set('Authorization', `Bearer ${token}`)
        .send(data);
      expect(res.status).toBe(422);
      expect(res.body.statusCode).toBe(422);
      expect(res.body).toHaveProperty('message');
      expect(res.body.message).toBeArray();
      expect(res.body.message).not.toBeEmpty();

      // there should be no errors for `oldPassword`
      expect(res.body.message).not.toIncludeAllPartialMembers([
        {
          property: 'oldPassword',
        },
      ]);

      // there should be no errors for 'newPassword'
      expect(res.body.message).not.toIncludeAllPartialMembers([
        {
          property: 'newPassword',
        },
      ]);

      // error for property 'newPasswordCheck' with constraints 'isNotEmpty'
      expect(res.body.message).toIncludeAllPartialMembers([
        {
          property: 'newPasswordCheck',
          constraints: expect.toContainKey('isNotEmpty'),
        },
      ]);
    });

    it('should return errors if `oldPassword`, `newPasswordCheck` is present but not `newPassword`', async () => {
      const data = {
        oldPassword: checkUps.password.correct,
        newPasswordCheck: checkUps.newPassword.correct,
      };
      const res = await request(global.app.getHttpServer())
        .post(`${global.prefix}/profile/changePassword`)
        .set('Authorization', `Bearer ${token}`)
        .send(data);
      expect(res.status).toBe(422);
      expect(res.body.statusCode).toBe(422);
      expect(res.body).toHaveProperty('message');
      expect(res.body.message).toBeArray();
      expect(res.body.message).not.toBeEmpty();

      // there should be no errors for `oldPassword`
      expect(res.body.message).not.toIncludeAllPartialMembers([
        {
          property: 'oldPassword',
        },
      ]);

      // error for property 'newPassword' with constraints 'isNotEmpty'
      expect(res.body.message).toIncludeAllPartialMembers([
        {
          property: 'newPassword',
          constraints: expect.toContainKey('isNotEmpty'),
        },
      ]);

      // there should be no errors for 'newPasswordCheck'
      expect(res.body.message).not.toIncludeAllPartialMembers([
        {
          property: 'newPasswordCheck',
        },
      ]);
    });

    it('should return errors if `oldPassword`, `newPassword` and `newPasswordCheck` sent but `newPassword` and `newPasswordCheck` are not equal.', async () => {
      const data = {
        oldPassword: checkUps.password.correct,
        newPassword: checkUps.newPassword.correct,
        newPasswordCheck: checkUps.newPassword.incorrect,
      };
      const res = await request(global.app.getHttpServer())
        .post(`${global.prefix}/profile/changePassword`)
        .set('Authorization', `Bearer ${token}`)
        .send(data);
      expect(res.status).toBe(422);
      expect(res.body.statusCode).toBe(422);
      expect(res.body).toHaveProperty('message');
      expect(res.body.message).toBeArray();
      expect(res.body.message).not.toBeEmpty();

      // there should be no errors for `oldPassword`
      expect(res.body.message).not.toIncludeAllPartialMembers([
        {
          property: 'oldPassword',
        },
      ]);

      // there should be no errors for 'newPassword'
      expect(res.body.message).not.toIncludeAllPartialMembers([
        {
          property: 'newPassword',
        },
      ]);

      // error for property 'newPasswordCheck' with constraint 'isNotEmpty'
      expect(res.body.message).toIncludeAllPartialMembers([
        {
          property: 'newPasswordCheck',
          constraints: expect.toContainKey('PasswordsMatch'),
        },
      ]);
    });

    it('should return errors if `oldPassword`, `newPassword` and `newPasswordCheck` sent but `newPaswordCheck` with spaces', async () => {
      const data = {
        oldPassword: checkUps.password.correct,
        newPassword: checkUps.newPassword.correct,
        newPasswordCheck: checkUps.newPassword.correctWithSpaces,
      };
      const res = await request(global.app.getHttpServer())
        .post(`${global.prefix}/profile/changePassword`)
        .set('Authorization', `Bearer ${token}`)
        .send(data);
      expect(res.status).toBe(422);
      expect(res.body.statusCode).toBe(422);
      expect(res.body).toHaveProperty('message');
      expect(res.body.message).toBeArray();
      expect(res.body.message).not.toBeEmpty();

      // there should be no errors for `oldPassword`
      expect(res.body.message).not.toIncludeAllPartialMembers([
        {
          property: 'oldPassword',
        },
      ]);

      // there should be no errors for 'newPassword'
      expect(res.body.message).not.toIncludeAllPartialMembers([
        {
          property: 'newPassword',
        },
      ]);

      // error for property 'newPasswordCheck' with constraint 'isNotEmpty'
      expect(res.body.message).toIncludeAllPartialMembers([
        {
          property: 'newPasswordCheck',
          constraints: expect.toContainKey('PasswordsMatch'),
        },
      ]);
    });

    it('should change password with correct data', async () => {
      const data = {
        oldPassword: checkUps.password.correct,
        newPassword: checkUps.newPassword.correct,
        newPasswordCheck: checkUps.newPassword.correct,
      };
      const res = await request(global.app.getHttpServer())
        .post(`${global.prefix}/profile/changePassword`)
        .set('Authorization', `Bearer ${token}`)
        .send(data);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('message');
    });

    it('should not authenticate with old password', async () => {
      const data = {
        email: checkUps.email.correct,
        password: checkUps.password.correct,
      };
      const res = await request(global.app.getHttpServer())
        .post(`${global.prefix}/auth`)
        .send(data);
      expect(res.status).toBe(401);
      token = res.body.token;
    });

    it('should authenticate with new password', async () => {
      const data = {
        email: checkUps.email.correct,
        password: checkUps.newPassword.correct,
      };
      const res = await request(global.app.getHttpServer())
        .post(`${global.prefix}/auth`)
        .send(data);
      expect(res.status).toBe(201);
      expect(res.body).toBeObject();
      expect(res.body).toHaveProperty('token');
      token = res.body.token;
    });

    it('should change password back', async () => {
      const data = {
        oldPassword: checkUps.newPassword.correct,
        newPassword: checkUps.password.correct,
        newPasswordCheck: checkUps.password.correct,
      };
      const res = await request(global.app.getHttpServer())
        .post(`${global.prefix}/profile/changePassword`)
        .set('Authorization', `Bearer ${token}`)
        .send(data);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('message');
    });

  });
};
