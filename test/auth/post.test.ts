import * as request from 'supertest';
import { SignupCheckups } from '../_data/signup.checkups';

export const AuthPostTest = () => {
  const checkUps = SignupCheckups;
  describe('[POST] /auth endpoint', () => {
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
  });
};
