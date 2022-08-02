import * as request from 'supertest';
import { SignupCheckups } from '../_data/signup.checkups';

export const DevicePostTest = () => {
  const checkUps = SignupCheckups;
  let token: string;
  let deviceId: string;

  describe('[POST] /devices endpoint', () => {
    it('must return 401 without token', async () => {
      const res = await request(global.app.getHttpServer())
        .post(`${global.prefix}/devices`)
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
        .post(`${global.prefix}/devices`)
        .set('Authorization', `Bearer ${token}`)
        .send(data);
      expect(res.status).toBe(422);
      expect(res.body.statusCode).toBe(422);
      expect(res.body).toHaveProperty('message');
      expect(res.body.message).toBeArray();
      expect(res.body.message).not.toBeEmpty();

      expect(res.body.message).toIncludeAllPartialMembers([
        {
          property: 'name',
          constraints: expect.toContainKey('isNotEmpty'),
        },
      ]);
    });

    it('should create device with `name` parameter inputted', async () => {
      const data = {
        name: 'Device',
      };
      const res = await request(global.app.getHttpServer())
        .post(`${global.prefix}/devices`)
        .set('Authorization', `Bearer ${token}`)
        .send(data);
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('message');
      expect(res.body.message).not.toBeEmpty();
      expect(res.body.message).toBe('Device successfully created.');
      expect(res.body).toHaveProperty('data');
      expect(res.body.data).not.toBeEmpty();
      expect(res.body.data).toBeObject();
      expect(res.body.data).toContainKey('id');
      expect(res.body.data).toContainKey('name');
      expect(res.body.data).toContainKey('password');
      expect(res.body.data.name).toBe('Device');
    });

    it('should have device in the database', async () => {
      const device = await global.appModule
        .get('DeviceRepository')
        .findOneBy({ id: deviceId });
      expect(device).not.toBeNull();
      expect(device).toHaveProperty('id');
      expect(device).toHaveProperty('name');
      expect(device.name).toBe('Device');
      expect(device).toHaveProperty('userId');
      expect(device).toHaveProperty('mqttPassword');
      expect(device).toHaveProperty('isDeleted');
      expect(device.isDeleted).toBe(false);
      expect(device).toHaveProperty('createDateTime');
      expect(device).toHaveProperty('updateDateTime');
    });
  });
};
