import * as request from 'supertest';

export const ProfileChangePasswordGetTest = () => {
  describe('[GET] /profile/changePassword endpoint', () => {
    it('must return 404 on get request', async () => {
      const res = await request(global.app.getHttpServer())
        .delete(`${global.prefix}/profile/changePassword`)
        .send();
      expect(res.status).toBe(404);
      expect(res.body.statusCode).toBe(404);
    });
  });
};
