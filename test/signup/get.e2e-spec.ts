import * as request from 'supertest';

describe('[GET] /signup endpoint', () => {
  it('must return 404 on get request', async () => {
    const res = await request(global.app.getHttpServer())
      .get(`${global.prefix}/signup`)
      .send();
    expect(res.status).toBe(404);
    expect(res.body.statusCode).toBe(404);
  });
});
