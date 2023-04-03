/* eslint-disable no-underscore-dangle */
const request = require('supertest');
const { default: mongoose } = require('mongoose');
const httpStatus = require('http-status');
const app = require('./config/server');
const connect = require('./config/database');
const { mongoUrl, host, jwtSecret } = require('./config/vars');

let token = 'Bearer ';

describe('Check before launching tests', () => {
  beforeAll(async () => {
    await connect();
  });

  test('Should make sure that we are using the test env variables ', async () => {
    if (process.env.APP_ENV === 'test') { await mongoose.connection.db.dropDatabase(() => console.log('Database dropped succesfully')); }
    expect(process.env.APP_ENV).toEqual('test');
  }, 10000);
});

describe('Testing Client API Endpoints', () => {
  let server;

  beforeAll(() => {
    server = app.listen(8080, async () => {
      await connect();
      console.log('Express server started on port 8080');
    });
  });

  afterAll(() => {
    server.close();
    mongoose.connection.close();
  });

  const user = {
    email: 'slimaneber@gmail.com',
    password: 'password',
    name: 'Slimaneber',
  };
  const account = {
    name: 'orpi',
    address: 'une address',
    city: 'Paris',
    postalCode: '75003',
    website: 'https://www.orpi.com',
  };

  let creditCard = {};

  // ================USER=================

  describe('POST /api/users', () => {
    test('should create an account', async () => {
      console.log(user);
      const res = await request(app).post('/api/users').send(user);
      user._id = res.body._id;
      expect(res.status).toEqual(200);
      expect(res.body.email).toEqual(user.email);
    });
  });

  describe('POST /api/users/login', () => {
    test('Should login an return a token', async () => {
      const { email, password } = user;
      const res = await request(app).post('/api/users/login').send({ email, password });
      expect(res.status).toEqual(200);
      token += res.body.token;
    });
  });

  describe('GET /api/users/:id', () => {
    test('should return a single user by id', async () => {
      const res = await request(app).get(`/api/users/${user._id}`);
      expect(res.status).toEqual(200);
      expect(res.body.email).toEqual(user.email);
    });

    test('should return 404 if agency is not found', async () => {
      const res = await request(app).get('/api/users/99');
      expect(res.status).toEqual(404);
    });
  });

  describe('PATCH /api/users/:id', () => {
    it('should update an existing user', async () => {
      const updatedUser = {
        name: 'Sliman',
        email: 'slimaneber2001@gmail.com',
      };
      const res = await request(app)
        .patch(`/api/users/${user._id}`)
        .send(updatedUser);
      console.log(user._idc);
      expect(res.status).toEqual(200);
      expect(res.body.name).toEqual(updatedUser.name);
    });

    it('should return 404 if user is not found', async () => {
      const res = await request(app).put('/api/users/99').send({ name: 'test' });
      expect(res.status).toEqual(404);
    });
  });

  // ================Account=================

  describe('POST /api/users/:userId/accounts', () => {
    test('should create an account ', async () => {
      const res = await request(app).post(`/api/users/${user._id}/accounts`).set('Authorization', token).send({ userId: user._id });
      account._id = res.body._id;
      expect(res.status).toEqual(200);
      expect(res.body.balance).toEqual(0);
    });

    describe('Authentication check on POST /api/users/:userId/accounts', () => {
      test('should return FORBIDDEN', async () => {
        const res = await request(app).post(`/api/users/${user._id}/accounts`).send(account);
        expect(res.status).toEqual(httpStatus.UNAUTHORIZED);
      });
    });
  });

  describe('GET /api/users/:userId/accounts', () => {
    test('should return all user accounts', async () => {
      const res = await request(app).get(`/api/users/${user._id}/accounts`).set('Authorization', token);
      expect(res.status).toEqual(200);
      expect(res.body[0].userId).toEqual(user._id);
    });

    describe('Authentication check on GET /api/users/:userId/accounts', () => {
      test('should return FORBIDDEN', async () => {
        const res = await request(app).get(`/api/users/${user._id}/accounts`);
        expect(res.status).toEqual(httpStatus.UNAUTHORIZED);
      });
    });
  });

  describe('GET /api/users/:userId/accounts/:accountId', () => {
    test('should return all user accounts', async () => {
      const res = await request(app).get(`/api/users/${user._id}/accounts/${account._id}`).set('Authorization', token);
      expect(res.status).toEqual(200);
      expect(res.body.userId).toEqual(user._id);
      expect(res.body._id).toEqual(account._id);
    });

    describe('Authentication check on GET /api/users/:userId/accounts', () => {
      test('should return FORBIDDEN', async () => {
        const res = await request(app).get(`/api/users/${user._id}/accounts`);
        expect(res.status).toEqual(httpStatus.UNAUTHORIZED);
      });
    });
  });

  describe('PATCH /api/users/:userId/accounts/:accountId', () => {
    test('should return update user accounts', async () => {
      const res = await request(app).patch(`/api/users/${user._id}/accounts/${account._id}`).set('Authorization', token).send({ isActive: false });
      expect(res.status).toEqual(200);
      expect(res.body.isActive).toEqual(false);
      expect(res.body._id).toEqual(account._id);
    });

    test('Authentication check should return FORBIDDEN', async () => {
      const res = await request(app).patch(`/api/users/${user._id}/accounts/${account._id}`);
      expect(res.status).toEqual(httpStatus.UNAUTHORIZED);
    });
  });

  // ================Credit cards=================

  describe('POST /api/users/:userId/accounts/:accountId/credit-cards', () => {
    test('should create a creditCard ', async () => {
      const res = await request(app).post(`/api/users/${user._id}/accounts/${account._id}/credit-cards`).set('Authorization', token);
      creditCard = res.body;
      expect(res.status).toEqual(200);
      expect(res.body.userId).toEqual(user._id);
      expect(res.body.accountId).toEqual(account._id);
    });

    describe('Authentication check on POST /api/users/:userId/accounts', () => {
      test('should return FORBIDDEN', async () => {
        const res = await request(app).post(`/api/users/${user._id}/accounts/${account._id}/credit-cards`);
        expect(res.status).toEqual(httpStatus.UNAUTHORIZED);
      });
    });
  });

  describe('GET /api/users/:userId/credit-cards', () => {
    test('should return All users creditCards  ', async () => {
      const res = await request(app).get(`/api/users/${user._id}/credit-cards`).set('Authorization', token);
      expect(res.status).toEqual(200);
      expect(res.body).toContainEqual(creditCard);
    });

    describe('Authentication check on GET /api/users/:userId/credit-cards', () => {
      test('should return FORBIDDEN', async () => {
        const res = await request(app).get(`/api/users/${user._id}/credit-cards`);
        expect(res.status).toEqual(httpStatus.UNAUTHORIZED);
      });
    });
  });

  describe('GET /api/users/:userId/credit-cards/:creditCardId', () => {
    test('should return All users creditCards  ', async () => {
      const res = await request(app).get(`/api/users/${user._id}/credit-cards/${creditCard._id}`).set('Authorization', token);
      expect(res.status).toEqual(200);
      expect(res.body).toEqual(creditCard);
    });

    describe('Authentication check on GET /api/users/:userId/credit-cards/:creditCardId', () => {
      test('should return FORBIDDEN', async () => {
        const res = await request(app).get(`/api/users/${user._id}/credit-cards/${creditCard._id}`);
        expect(res.status).toEqual(httpStatus.UNAUTHORIZED);
      });
    });
  });

  describe('PATCH /api/users/:userId/credit-cards/:creditCardId', () => {
    test('should return update a creditCard', async () => {
      const updatedValues = { isActive: false, allowedLimit: 20000 };
      const res = await request(app).patch(`/api/users/${user._id}/credit-cards/${creditCard._id}`).set('Authorization', token).send(updatedValues);
      expect(res.status).toEqual(200);
      expect(res.body.isActive).toEqual(updatedValues.isActive);
      expect(res.body.allowedLimit).toEqual(updatedValues.allowedLimit);
    });

    describe('Authentication check on PATCH /api/users/:userId/credit-cards', () => {
      test('should return FORBIDDEN', async () => {
        const res = await request(app).patch(`/api/users/${user._id}/credit-cards/${creditCard._id}`);
        expect(res.status).toEqual(httpStatus.UNAUTHORIZED);
      });
    });

    describe('Allowed fields check on PATCH /api/users/:userId/credit-cards', () => {
      test('should return BAD_REQUEST', async () => {
        const updatedValues = { isActive: false, securityCode: '213' };
        const res = await request(app).patch(`/api/users/${user._id}/credit-cards/${creditCard._id}`).set('Authorization', token).send(updatedValues);
        expect(res.status).toEqual(httpStatus.BAD_REQUEST);
      });
    });
  });

  // ================Transactions=================

  // describe('GET /api/users/:userId/accounts', () => {
  //   test('should return all user accounts', async () => {
  //     const res = await request(app).get(`/api/users/${user._id}/accounts`).set('Authorization', token);
  //     expect(res.status).toEqual(200);
  //     expect(res.body[0].userId).toEqual(user._id);
  //   });

  //   describe('Authentication check on GET /api/users/:userId/accounts', () => {
  //     test('should return FORBIDDEN', async () => {
  //       const res = await request(app).get(`/api/users/${user._id}/accounts`);
  //       expect(res.status).toEqual(httpStatus.UNAUTHORIZED);
  //     });
  //   });
  // });

  // describe('GET /api/users/:userId/accounts/:accountId', () => {
  //   test('should return all user accounts', async () => {
  //     const res = await request(app).get(`/api/users/${user._id}/accounts/${account._id}`).set('Authorization', token);
  //     expect(res.status).toEqual(200);
  //     expect(res.body.userId).toEqual(user._id);
  //     expect(res.body._id).toEqual(account._id);
  //   });

  //   describe('Authentication check on GET /api/users/:userId/accounts', () => {
  //     test('should return FORBIDDEN', async () => {
  //       const res = await request(app).get(`/api/users/${user._id}/accounts`);
  //       expect(res.status).toEqual(httpStatus.UNAUTHORIZED);
  //     });
  //   });
  // });

  // describe('PATCH /api/users/:userId/accounts/:accountId', () => {
  //   test('should return update user accounts', async () => {
  //     const res = await request(app).patch(`/api/users/${user._id}/accounts/${account._id}`).set('Authorization', token).send({ isActive: false });
  //     expect(res.status).toEqual(200);
  //     expect(res.body.isActive).toEqual(false);
  //     expect(res.body._id).toEqual(account._id);
  //   });

  //   test('Authentication check should return FORBIDDEN', async () => {
  //     const res = await request(app).patch(`/api/users/${user._id}/accounts/${account._id}`);
  //     expect(res.status).toEqual(httpStatus.UNAUTHORIZED);
  //   });
  // });
});
