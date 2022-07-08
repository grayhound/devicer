import * as request from 'supertest';

export const ProfilePutTest = () => {
  describe('[PUT] /profile endpoint', () => {
    it('must return 404 on get request', async () => {
      const res = await request(global.app.getHttpServer())
        .put(`${global.prefix}/profile`)
        .send();
      expect(res.status).toBe(404);
      expect(res.body.statusCode).toBe(404);
    });
  });
}
