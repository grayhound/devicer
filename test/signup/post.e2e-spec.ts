import * as request from 'supertest';
import exp from 'constants';

describe('[POST] /signup endpoint', () => {
  // check up variables
  const checkUps = {
    email: {
      // correct and incorrect email
      incorrect: 'test',
      correct: 'test@test.com',

      // correct and duplicate email with uppercase
      uppercaseDuplicate: 'Test@test.com',
      uppercaseCorrect: 'Test2@test.com',

      // whitespace correct and duplicate
      whitespaceDuplicate: '  Test@test.com  ',
      whitespaceCorrect: '    Test3@test.com   ',

      // test inner whitespace - incorrect email
      innerWhitespaceIncorrect: 'test @gm ail.com',

      // test boolean - incorrect email
      booleanIncorrect: true,

      // test number - incorrect email
      numberIncorrect: 1000,
    },
    password: {
      correct: 'test',
    },
    passwordCheck: {
      correct: 'test',
      incorrect: 'Test',
    },
  };

  it('must return 404 on get request', async () => {
    const res = await request(global.app.getHttpServer())
      .get(`${global.prefix}/signup`)
      .send();
    expect(res.status).toBe(404);
    expect(res.body.statusCode).toBe(404);
    // res.body.should.have.property('success').eq(false);
    // res.body.should.have.property('type').eq('endpoint');
  });

  it('should return errors without any data sent', async () => {
    const data = {};
    const res = await request(global.app.getHttpServer())
      .post(`${global.prefix}/signup`)
      .send(data);
    expect(res.status).toBe(422);
    expect(res.body.statusCode).toBe(422);
    expect(res.body).toHaveProperty('message');
    expect(res.body.message).toBeArray();
    expect(res.body.message).not.toBeEmpty();

    // error for property 'email' with constraints 'isNotEmpty'
    expect(res.body.message).toIncludeAllPartialMembers([
      {
        property: 'email',
        constraints: expect.toContainKey('isNotEmpty'),
      },
    ]);

    // error for property 'password' with constraints 'isNotEmpty'
    expect(res.body.message).toIncludeAllPartialMembers([
      {
        property: 'password',
        constraints: expect.toContainKey('isNotEmpty'),
      },
    ]);

    // error for property 'passwordCheck' with constraints 'isNotEmpty'
    expect(res.body.message).toIncludeAllPartialMembers([
      {
        property: 'passwordCheck',
        constraints: expect.toContainKey('isNotEmpty'),
      },
    ]);
  });

  it('should return errors if email in wrong format', async () => {
    const data = { email: checkUps.email.incorrect };
    const res = await request(global.app.getHttpServer())
      .post(`${global.prefix}/signup`)
      .send(data);
    expect(res.status).toBe(422);
    expect(res.body.statusCode).toBe(422);
    expect(res.body).toHaveProperty('message');
    expect(res.body.message).toBeInstanceOf(Array);

    // should not get error for property 'email' with contrainsts 'isNotEmpty'
    expect(res.body.message).not.toIncludeAllPartialMembers([
      {
        property: 'email',
        constraints: expect.toContainKey('isNotEmpty'),
      },
    ]);

    // error for property 'email' with constraints 'isEmail'
    expect(res.body.message).toIncludeAllPartialMembers([
      {
        property: 'email',
        constraints: expect.toContainKey('isEmail'),
      },
    ]);

    // error for property 'password' with constraints 'isNotEmpty'
    expect(res.body.message).toIncludeAllPartialMembers([
      {
        property: 'password',
        constraints: expect.toContainKey('isNotEmpty'),
      },
    ]);

    // error for property 'passwordCheck' with constraints 'isNotEmpty'
    expect(res.body.message).toIncludeAllPartialMembers([
      {
        property: 'passwordCheck',
        constraints: expect.toContainKey('isNotEmpty'),
      },
    ]);
  });

  it('should not return email error if email is in correct format', async () => {
    const data = { email: checkUps.email.correct };
    const res = await request(global.app.getHttpServer())
      .post(`${global.prefix}/signup`)
      .send(data);
    expect(res.status).toBe(422);
    expect(res.body.statusCode).toBe(422);
    expect(res.body).toHaveProperty('message');
    expect(res.body.message).toBeInstanceOf(Array);

    // should not return error with property email
    expect(res.body.message).not.toIncludeAllPartialMembers([
      {
        property: 'email',
      },
    ]);

    // error for property 'password' with constraints 'isNotEmpty'
    expect(res.body.message).toIncludeAllPartialMembers([
      {
        property: 'password',
        constraints: expect.toContainKey('isNotEmpty'),
      },
    ]);

    // error for property 'passwordCheck' with constraints 'isNotEmpty'
    expect(res.body.message).toIncludeAllPartialMembers([
      {
        property: 'passwordCheck',
        constraints: expect.toContainKey('isNotEmpty'),
      },
    ]);
  });

  it('should not return error if `password` is present', async () => {
    const data = {
      email: checkUps.email.correct,
      password: checkUps.password.correct,
    };
    const res = await request(global.app.getHttpServer())
      .post(`${global.prefix}/signup`)
      .send(data);
    expect(res.status).toBe(422);
    expect(res.body.statusCode).toBe(422);
    expect(res.body).toHaveProperty('message');
    expect(res.body.message).toBeInstanceOf(Array);

    // should not return error with property email
    expect(res.body.message).not.toIncludeAllPartialMembers([
      {
        property: 'email',
      },
    ]);

    // should not return error for property 'password' with constraints 'isNotEmpty'
    expect(res.body.message).not.toIncludeAllPartialMembers([
      {
        property: 'password',
        constraints: expect.toContainKey('isNotEmpty'),
      },
    ]);

    // error for property 'passwordCheck' with constraints 'isNotEmpty'
    expect(res.body.message).toIncludeAllPartialMembers([
      {
        property: 'passwordCheck',
        constraints: expect.toContainKey('isNotEmpty'),
      },
    ]);
  });

  it('should not return error if `passwordCheck` is present (but still not equal to to password)', async () => {
    const data = {
      email: checkUps.email.correct,
      password: checkUps.password.correct,
      passwordCheck: checkUps.passwordCheck.incorrect,
    };
    const res = await request(global.app.getHttpServer())
      .post(`${global.prefix}/signup`)
      .send(data);
    expect(res.status).toBe(422);
    expect(res.body.statusCode).toBe(422);
    expect(res.body).toHaveProperty('message');
    expect(res.body.message).toBeInstanceOf(Array);

    // should not return error with property email
    expect(res.body.message).not.toIncludeAllPartialMembers([
      {
        property: 'email',
      },
    ]);

    // should not return error for property 'password' with constraints 'isNotEmpty'
    expect(res.body.message).not.toIncludeAllPartialMembers([
      {
        property: 'password',
        constraints: expect.toContainKey('isNotEmpty'),
      },
    ]);

    // error for property 'passwordCheck' with constraints 'isNotEmpty'
    expect(res.body.message).not.toIncludeAllPartialMembers([
      {
        property: 'passwordCheck',
        constraints: expect.toContainKey('isNotEmpty'),
      },
    ]);

    // error for property `passwordCheck` if passwords differ
    expect(res.body.message).toIncludeAllPartialMembers([
      {
        property: 'passwordCheck',
        constraints: expect.toContainKey('PasswordsMatch'),
      },
    ]);
  });

  it('should signup user if everything is correct', async () => {
    const data = {
      email: checkUps.email.correct,
      password: checkUps.password.correct,
      passwordCheck: checkUps.passwordCheck.correct,
    };
    const res = await request(global.app.getHttpServer())
      .post(`${global.prefix}/signup`)
      .send(data);
    expect(res.status).toBe(201);
    expect(res.body).toBeObject();
    expect(res.body).toHaveProperty('email');
  });

  /*
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
