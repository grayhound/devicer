import * as request from 'supertest';
import { getServerApp } from './../setupTests';

describe('SignupTest', () => {
  let app;
  beforeAll(() => {
    app = getServerApp();
  });

  describe('/signup endpoint', () => {
    it('must return 404 on get request', async () => {
      const res = await request(app.getHttpServer()).get('/v1/signup').send();
      expect(res.status).toBe(404);
      //res.body.should.have.property('success').eq(false);
      //res.body.should.have.property('type').eq('endpoint');
    });

    it('should return error without any data sent', async () => {
      const data = {};
      const res = await request(app.getHttpServer())
        .post('/v1/signup')
        .send(data);
      expect(res.status).toBe(422);
    });

    /*
    it('should return error if email in wrong format', async () => {
      const data = { email: 'test' };
      const res = await request(app.getHttpServer()).get('/signup').send(data);
      expect(res.status).toBe(422);

      // res.body.should.have.property('code').eq(422);
      // res.body.should.have.property('success').eq(false);
      chai.request(app.server)
      .post(`${options.apiPrefix}/users/signup`)
      .send(data)
      .end((err, res) => {
        res.should.have.status(422);
        res.body.should.have.property('success').eq(false);
        res.body.should.have.property('code').eq(422);
        res.body.should.have.property('errors');
        res.body.errors.should.be.a('array');
        res.body.errors.should.containSubset([{code: 3, param: 'email'}]);
        done();
      });
    });

    it('should return success if everything is correct', (done) => {
      const data = {username: 'jasonhound', email: 'test@test.com'};
      chai.request(app.server)
      .post(`${options.apiPrefix}/users/signup`)
      .send(data)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.have.property('token');
        res.body.should.have.property('refreshToken');
        done();
      });
    });

    it('user data must be correct', (done) => {
      app.models.User.findOne({email: 'test@test.com'}).exec().then((user) => {
        user._id.should.exist;
        user.email.should.exist.eq('test@test.com');
        user.username.should.exist.eq('jasonhound');
        done();
      });
    });

    it('should return success if everything is correct - check trim()', (done) => {
      const data = {username: '    jhound    ', email: '     test2@test.com      '};
      chai.request(app.server)
      .post(`${options.apiPrefix}/users/signup`)
      .send(data)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.have.property('token');
        res.body.should.have.property('refreshToken');
        done();
      });
    });

    it('user data must be correct', (done) => {
      app.models.User.findOne({email: 'test2@test.com'}).exec().then((user) => {
        user._id.should.exist;
        user.email.should.exist.eq('test2@test.com');
        user.username.should.exist.eq('jhound');
        done();
      });
    });

    it('should return error because user with this username already exists', (done) => {
      const data = {username: 'jhound'};
      chai.request(app.server)
      .post(`${options.apiPrefix}/users/signup`)
      .send(data)
      .end((err, res) => {
        res.should.have.status(422);
        res.body.should.have.property('success').eq(false);
        res.body.should.have.property('code').eq(422);
        res.body.should.have.property('errors');
        res.body.errors.should.be.a('array');
        res.body.errors.should.containSubset([{code: 2, param: 'username'}]);
        done();
      });
    });

    it('should return error because user with this username already exists - check camelCase', (done) => {
      const data = {username: 'Jhound'};
      chai.request(app.server)
      .post(`${options.apiPrefix}/users/signup`)
      .send(data)
      .end((err, res) => {
        res.should.have.status(422);
        res.body.should.have.property('success').eq(false);
        res.body.should.have.property('code').eq(422);
        res.body.should.have.property('errors');
        res.body.errors.should.be.a('array');
        res.body.errors.should.containSubset([{code: 2, param: 'username'}]);
        done();
      });
    });

    it('should return error because email already exists - check camelCase', (done) => {
      const data = {username: 'jasonhound1', email: 'Test@test.com'};
      chai.request(app.server)
      .post(`${options.apiPrefix}/users/signup`)
      .send(data)
      .end((err, res) => {
        res.should.have.status(422);
        res.body.should.have.property('success').eq(false);
        res.body.should.have.property('code').eq(422);
        res.body.should.have.property('errors');
        res.body.errors.should.be.a('array');
        res.body.errors.should.containSubset([{code: 4, param: 'email'}]);
        done();
      });
    });
    */
  });
});
