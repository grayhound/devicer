import * as request from 'supertest';

export const AuthDeleteTest = () => {
  describe('[DELETE] /auth endpoint', () => {
    it('must return 404 on get request', async () => {
      const res = await request(global.app.getHttpServer())
        .delete(`${global.prefix}/auth`)
        .send();
      expect(res.status).toBe(404);
      expect(res.body.statusCode).toBe(404);
    });
  });
};
