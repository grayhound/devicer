import * as request from 'supertest';
import { SignupCheckups } from '../_data/signup.checkups';

export const DevicePostTest = () => {
  const checkUps = SignupCheckups;
  describe('[POST] /signup endpoint', () => {
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
  });
};
