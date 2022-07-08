import * as request from 'supertest';

export const AuthGetTest = () => {
  describe('[GET] /auth endpoint', () => {
    it('must return 404 on get request', async () => {
      const res = await request(global.app.getHttpServer())
        .get(`${global.prefix}/auth`)
        .send();
      expect(res.status).toBe(404);
      expect(res.body.statusCode).toBe(404);
    });
  });
};
