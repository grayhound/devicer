import * as request from 'supertest';

export const DevicePutTest = () => {
  describe('[PUT] /devices endpoint', () => {
    it('must return 404 on PUT request', async () => {
      const res = await request(global.app.getHttpServer())
        .put(`${global.prefix}/devices`)
        .send();
      expect(res.status).toBe(404);
      expect(res.body.statusCode).toBe(404);
    });
  });
};
