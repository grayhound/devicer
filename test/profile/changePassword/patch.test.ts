import * as request from 'supertest';

export const ProfileChangePasswordPatchTest = () => {
  describe('[PATCH] /profile/changePassword endpoint', () => {
    it('must return 404 on PATCH request', async () => {
      const res = await request(global.app.getHttpServer())
        .patch(`${global.prefix}/profile/changePassword`)
        .send();
      expect(res.status).toBe(404);
      expect(res.body.statusCode).toBe(404);
    });
  });
}
