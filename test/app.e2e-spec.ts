import * as request from 'supertest';
import { getServerApp } from './setupTests';

describe('Tests', () => {
  let app;
  beforeAll(() => {
    app = getServerApp();
  });
  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/v1')
      .expect(200)
      .expect('Hello World!');
  });
});
