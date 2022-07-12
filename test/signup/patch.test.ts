import * as request from 'supertest';

export const SignupPatchTest = () => {
  describe('[PATCH] /signup endpoint', () => {
    it('must return 404 on PATCH request', async () => {
      const res = await request(global.app.getHttpServer())
        .patch(`${global.prefix}/signup`)
        .send();
      expect(res.status).toBe(404);
      expect(res.body.statusCode).toBe(404);
    });
  });
}
