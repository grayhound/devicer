import * as request from 'supertest';

export const ProfileDeleteTest = () => {
  describe('[DELETE] /profile endpoint', () => {
    it('must return 404 on DELETE request', async () => {
      const res = await request(global.app.getHttpServer())
        .delete(`${global.prefix}/profile`)
        .send();
      expect(res.status).toBe(404);
      expect(res.body.statusCode).toBe(404);
    });
  });
};
