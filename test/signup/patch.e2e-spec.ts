import * as request from 'supertest';

describe('[PATCH] /signup endpoint', () => {
  it('must return 404 on get request', async () => {
    const res = await request(global.app.getHttpServer())
      .patch(`${global.prefix}/signup`)
      .send();
    expect(res.status).toBe(404);
    expect(res.body.statusCode).toBe(404);
    // res.body.should.have.property('success').eq(false);
    // res.body.should.have.property('type').eq('endpoint');
  });
});
