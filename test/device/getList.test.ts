import * as request from 'supertest';
import { createFakeUser } from '../_fakes/devices.user.fakes';

const fakeUsers = [];
const tokens = {};

Array.from({ length: 3 }).forEach(() => {
  fakeUsers.push(createFakeUser());
});
console.log(fakeUsers);

export const DeviceGetListTest = () => {
  describe('[GET] /devices endpoint', () => {
    /*
    it('must return 401 without token', async () => {
      const res = await request(global.app.getHttpServer())
        .get(`${global.prefix}/devices`)
        .send();
      expect(res.status).toBe(401);
    });
    */

    // create fake users
    test.each(fakeUsers)(
      'should signup user $email if everything is correct',
      async ({ email, password, passwordCheck }) => {
        const data = {
          email,
          password,
          passwordCheck,
        };
        const res = await request(global.app.getHttpServer())
          .post(`${global.prefix}/signup`)
          .send(data);
        expect(res.status).toBe(201);
        expect(res.body).toBeObject();
        expect(res.body).toHaveProperty('email');
        expect(res.body.email).toBe(email);
      },
    );

    // authenticate fake
  });
};
