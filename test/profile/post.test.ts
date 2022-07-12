import * as request from 'supertest';

export const ProfilePostTest = () => {
  describe('[POST] /profile endpoint', () => {
    it('must return 404 on POST request', async () => {
      const res = await request(global.app.getHttpServer())
        .post(`${global.prefix}/profile`)
        .send();
      expect(res.status).toBe(404);
      expect(res.body.statusCode).toBe(404);
    });
  });
};
