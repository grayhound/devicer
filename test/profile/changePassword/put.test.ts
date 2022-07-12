import * as request from 'supertest';

export const ProfileChangePasswordPutTest = () => {
  describe('[PUT] /profile/changePassword endpoint', () => {
    it('must return 404 on PUT request', async () => {
      const res = await request(global.app.getHttpServer())
        .put(`${global.prefix}/profile/changePassword`)
        .send();
      expect(res.status).toBe(404);
      expect(res.body.statusCode).toBe(404);
    });
  });
}
