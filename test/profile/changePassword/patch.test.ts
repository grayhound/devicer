import * as request from 'supertest';

export const ProfilePatchTest = () => {
  describe('[PATCH] /profile endpoint', () => {
    it('must return 404 on get request', async () => {
      const res = await request(global.app.getHttpServer())
        .patch(`${global.prefix}/auth`)
        .send();
      expect(res.status).toBe(404);
      expect(res.body.statusCode).toBe(404);
    });
  });
}
