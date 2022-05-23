import * as request from 'supertest';
import { getServerApp } from './../setupTests';

describe('Unkind Rewind', () => {
  let app;
  beforeAll(() => {
    app = getServerApp();
  });
  it('RAZZA', () => {
    return request(app.getHttpServer())
      .get('/xxx')
      .expect(404);
  });
});
