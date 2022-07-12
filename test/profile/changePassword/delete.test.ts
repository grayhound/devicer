import * as request from 'supertest';

export const ProfileChangePasswordDeleteTest = () => {
  describe('[DELETE] /profile/changePassword endpoint', () => {
    it('must return 404 on delete request', async () => {
      const res = await request(global.app.getHttpServer())
        .delete(`${global.prefix}/profile/changePassword`)
        .send();
      expect(res.status).toBe(404);
      expect(res.body.statusCode).toBe(404);
    });
  });
};
