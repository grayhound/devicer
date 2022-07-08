import * as request from 'supertest';
import { SignupCheckups } from '../_data/signup.checkups';

export const ProfileGetTest = () => {
  const checkUps = SignupCheckups;
  let token;

  describe('[GET] /profile endpoint', () => {
    it('must return 401 without token', async () => {
      const res = await request(global.app.getHttpServer())
        .get(`${global.prefix}/profile`)
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

    it('should get a profile', async () => {
      const res = await request(global.app.getHttpServer())
        .get(`${global.prefix}/profile`)
        .set('Authorization', `Bearer ${token}`)
        .send();
      expect(res.status).toBe(200);
      expect(res.body).toBeObject();
      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('email');
      expect(res.body.email).toBe(checkUps.email.correct);
    });
  });
};
